from config import settings
import docker
from docker.errors import DockerException
import logging
import socket
import psutil
import platform
import uuid
from typing import List, Dict, Any, Optional, Set, Tuple
from datetime import datetime
import json
import requests

from database import DiscoveredService, SessionLocal

logger = logging.getLogger(__name__)


class DockerServiceDiscovery:
    """Discovers services running in Docker containers"""
    
    def __init__(self):
        self.client = None
        try:
            # Connect to the Docker daemon
            self.client = docker.from_env()
            logger.info("Docker client initialized successfully")
        except DockerException as e:
            logger.error(f"Failed to connect to Docker daemon: {e}")

    def discover_services(self, target_ports: Optional[List[int]] = None) -> List[Dict[str, Any]]:
        """
        Discover Docker containers, optionally filtering by exposed ports
        
        Args:
            target_ports: List of ports to filter by, if None all containers are returned
            
        Returns:
            List of container info dictionaries
        """
        if not self.client:
            logger.error("Docker client not initialized")
            return []
            
        discovered = []
        try:
            # Get all running containers
            containers = self.client.containers.list()
            
            for container in containers:
                container_info = self._extract_container_info(container)
                
                # Filter by target ports if specified
                if target_ports:
                    # Fix: Access port information directly from container_info
                    main_port = container_info.get('port')
                    additional_ports = container_info.get('additional_ports', [])
                    all_ports = [main_port] + additional_ports if main_port else additional_ports
                    
                    if any(port in target_ports for port in all_ports if port):
                        discovered.append(container_info)
                else:
                    discovered.append(container_info)
                    
            return discovered
        except DockerException as e:
            logger.error(f"Error discovering Docker containers: {e}")
            return []
    
    def _extract_container_info(self, container) -> Dict[str, Any]:
        """Extract relevant information from a container object"""
        port_mappings = self._get_port_mappings(container)
        host_ports = self._get_host_ports(port_mappings)
        
        # Get the primary port (first exposed port)
        primary_port = host_ports[0] if host_ports else None
        
        container_info = {
            'service_id': container.id,
            'name': container.name,
            'service_type': 'docker',
            'host': 'localhost',
            'port': primary_port,
            'status': container.status,
            'additional_ports': host_ports[1:] if len(host_ports) > 1 else [],
            'details': {
                'image': container.image.tags[0] if container.image.tags else container.image.id,
                'created': container.attrs['Created'],
                'port_mappings': port_mappings,
                'networks': list(container.attrs['NetworkSettings']['Networks'].keys()),
                'labels': container.labels
            }
        }
        return container_info
    
    def _get_port_mappings(self, container) -> Dict[str, List[Dict[str, int]]]:
        """Extract port mappings from a container"""
        port_mappings = {}
        ports = container.attrs['NetworkSettings']['Ports'] or {}
        
        for container_port, host_bindings in ports.items():
            if host_bindings:
                port_info = []
                for binding in host_bindings:
                    port_info.append({
                        'host_ip': binding['HostIp'] or '0.0.0.0',
                        'host_port': int(binding['HostPort'])
                    })
                port_mappings[container_port] = port_info
        
        return port_mappings
    
    def _get_host_ports(self, port_mappings: Dict) -> List[int]:
        """Extract all host ports from port mappings"""
        host_ports = []
        for bindings in port_mappings.values():
            for binding in bindings:
                host_ports.append(binding['host_port'])
        return host_ports


class LocalServiceDiscovery:
    """Discovers services running locally on the machine"""
    
    def __init__(self):
        self.system = platform.system()

    def discover_services(self, target_ports: Optional[List[int]] = None) -> List[Dict[str, Any]]:
        """
        Discover local services running on specific ports
        
        Args:
            target_ports: List of ports to scan for, if None uses common service ports
            
        Returns:
            List of service info dictionaries
        """
        # If no target ports specified, use some common service ports
        if not target_ports:
            target_ports = [80, 443, 3000, 3001, 4200, 5000, 5001, 8000, 8080, 8888]
        
        discovered_services = []
        
        # Get connections information
        connections = self._get_connections()
        
        # Check if specified ports are open
        for port in target_ports:
            # Check if port is open using a socket
            if self._is_port_open('localhost', port):
                # Try to find process information for this port
                pid = self._get_pid_for_port(connections, port)
                process_info = self._get_process_info(pid) if pid else None
                
                service_info = {
                    'service_id': f"local-{port}-{str(uuid.uuid4())[:8]}",
                    'name': f"Local Service on port {port}",
                    'service_type': 'local',
                    'host': 'localhost',
                    'port': port,
                    'status': 'running',
                    'additional_ports': [],
                    'details': {
                        'process': process_info,
                        'open_port': port
                    }
                }
                
                # If process info available, enhance service info
                if process_info:
                    service_info['name'] = f"{process_info.get('name', 'Unknown')} (Port {port})"
                    if process_info.get('open_ports'):
                        service_info['additional_ports'] = [p for p in process_info.get('open_ports', []) 
                                                           if p != port and p in target_ports]
                
                discovered_services.append(service_info)
        
        return discovered_services
    
    def _is_port_open(self, host: str, port: int) -> bool:
        """Check if a specific port is open on the host"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.5)  # Short timeout for responsiveness
                result = s.connect_ex((host, port))
                return result == 0
        except Exception as e:
            logger.error(f"Error checking port {port}: {e}")
            return False
    
    def _get_connections(self) -> List[Tuple]:
        """Get all network connections on the system"""
        try:
            return psutil.net_connections()
        except Exception as e:
            logger.error(f"Error getting network connections: {e}")
            return []
    
    def _get_pid_for_port(self, connections: List[Tuple], port: int) -> Optional[int]:
        """Find process ID that has the specified port open"""
        for conn in connections:
            if conn.laddr.port == port and conn.status == 'LISTEN':
                return conn.pid
        return None
    
    def _get_process_info(self, pid: int) -> Optional[Dict[str, Any]]:
        """Get information about a process by its PID"""
        try:
            process = psutil.Process(pid)
            cmd_line = process.cmdline()
            
            # Get other ports this process might have open
            open_ports = set()
            for conn in psutil.Process(pid).connections():
                if conn.status == 'LISTEN':
                    open_ports.add(conn.laddr.port)
            
            return {
                'pid': pid,
                'name': process.name(),
                'exe': process.exe(),
                'cmd_line': cmd_line,
                'username': process.username(),
                'create_time': datetime.fromtimestamp(process.create_time()).isoformat(),
                'open_ports': list(open_ports)
            }
        except Exception as e:
            logger.error(f"Error getting process info for PID {pid}: {e}")
            return None

class EnvServiceDiscovery:
    """Discovers services based on URLs configured in environment variables"""
    
    def __init__(self):
        self.urls = settings.DISCOVERY_URLS
    
    def get_urls(self) -> List[str]:
        """
        Parse and return the URLs configured in environment variables
        
        Returns:
            List of URLs to be discovered
        """
        if not self.urls:
            return []
            
        # Split by comma if multiple URLs are provided
        if ',' in self.urls:
            urls = [url.strip() for url in self.urls.split(',')]
        else:
            urls = [self.urls.strip()]
            
        # Filter out any empty strings
        return [url for url in urls if url]
    
    def discover_services(self, target_ports: Optional[List[int]] = None) -> List[Dict[str, Any]]:
        """
        Discover services from configured URLs and attempt to fetch their details
        
        Args:
            target_ports: Not used for URL-based discovery
            
        Returns:
            List of service info dictionaries
        """
        urls = self.get_urls()
        discovered_services = []
        
        for url in urls:
            service_info = self._get_service_info(url)
            if service_info:
                discovered_services.append(service_info)
        
        return discovered_services
    
    def _get_service_info(self, base_url: str) -> Dict[str, Any]:
        """
        Fetch service information from a given URL
        
        Args:
            base_url: Base URL of the service
            
        Returns:
            Dictionary with service details
        """
        # Generate a consistent service_id based on the URL
        service_id = f"url-{str(uuid.uuid5(uuid.NAMESPACE_URL, base_url))}"
                
        port = base_url.split(':')[-1] if ':' in base_url else None
        # http://localhost:5002 remove the port
        host = base_url.split('/')[2].split(':')[0] if '//' in base_url else base_url.split('/')[0]
        
        # Set default values
        service_info = {
            'service_id': service_id,
            'name': f"API: {base_url}",
            'service_type': 'external',
            'host': host,
            'port': port,
            'status': 'unknown',
            'additional_ports': [],
            'details': {'url': base_url}
        }
        
        try:
            # Try to fetch API details from common endpoints
            response = self._fetch_endpoint(f"{base_url}/name") or \
                   self._fetch_endpoint(f"{base_url}/api/name")
            
            # Update service info with fetched details
            if response:
                service_info['name'] = response.get('name', base_url)
                service_info['details']['description'] = response.get('description', 'No description available')
            
            # Set status based on successful connection
            service_info['status'] = 'running'
                
        except Exception as e:
            logger.error(f"Error fetching details for {base_url}: {e}")
            service_info['status'] = 'error'
            service_info['details']['error'] = str(e)
            
        return service_info
    
    def _fetch_endpoint(self, url: str) -> Any:
        """
        Fetch data from an endpoint
        
        Args:
            url: URL to fetch from
            
        Returns:
            Response data or None if request failed
        """
        try:
            response = requests.get(url, timeout=3)
            if response.status_code == 200:
                try:
                    return response.json()
                except ValueError:
                    return response.text
            return None
        except Exception:
            return None


class UnifiedServiceDiscovery:
    """Combines Docker and local service discovery"""
    
    def __init__(self):
        if not settings.DISCOVERY_ENABLED:
            logger.info("Service discovery is disabled")
            return
        
        self.docker_discovery = DockerServiceDiscovery()
        self.local_discovery = LocalServiceDiscovery()
        self.env_discovery = EnvServiceDiscovery()
    
    def discover_services(self, target_ports: Optional[List[int]] = None) -> List[Dict[str, Any]]:
        """
        Discover services from both Docker and local processes
        
        Args:
            target_ports: List of ports to scan for
            
        Returns:
            Combined list of discovered services
        """
        if not settings.DISCOVERY_ENABLED:
            logger.info("Service discovery is disabled")
            return []
        
        TARGET_PORTS = list(range(settings.DISCOVERY_PORT_RANGE_START, settings.DISCOVERY_PORT_RANGE_END + 1))
        if target_ports:
            target_ports = [port for port in target_ports if port in TARGET_PORTS]
        else:
            target_ports = TARGET_PORTS
                    
        docker_services = self.docker_discovery.discover_services(target_ports)
        local_services = self.local_discovery.discover_services(target_ports)
        env_services = self.env_discovery.discover_services(target_ports)
        
        # Filter out local services that match Docker services to avoid duplicates
        docker_ports = {service['port'] for service in docker_services if service['port'] is not None}
        filtered_local_services = [
            service for service in local_services 
            if service['port'] not in docker_ports
        ]
        
        return docker_services + env_services + filtered_local_services
    
    def sync_with_database(self, target_ports: Optional[List[int]] = None) -> List[DiscoveredService]:
        """
        Discover services and sync with the database
        
        Args:
            target_ports: Optional list of ports to filter by
            
        Returns:
            List of DiscoveredService objects that match the criteria
        """
        discovered_services = self.discover_services(target_ports)
        
        # Connect to the database
        db = SessionLocal()
        try:
            # Get existing services by service_id
            existing_services = {
                service.service_id: service 
                for service in db.query(DiscoveredService).all()
            }
            
            updated_services = []
            
            # Process discovered services to ensure they have all required fields
            processed_services = []
            for service_info in discovered_services:
                # Handle URL-based services from EnvServiceDiscovery
                if 'url' in service_info and 'service_id' not in service_info:
                    url = service_info['url']
                    # Generate a consistent service_id based on the URL
                    service_id = f"url-{str(uuid.uuid5(uuid.NAMESPACE_URL, url))}"
                    processed_service = {
                        'service_id': service_id,
                        'name': f"External Service: {url}",
                        'service_type': 'external',
                        'host': url,
                        'port': None,
                        'status': 'available',
                        'additional_ports': [],
                        'details': {'url': url}
                    }
                    processed_services.append(processed_service)
                else:
                    processed_services.append(service_info)
            
            for service_info in processed_services:
                service_id = service_info['service_id']
                
                if service_id in existing_services:
                    # Update existing service
                    service = existing_services[service_id]
                    service.name = service_info['name']
                    service.host = service_info.get('host', 'localhost')
                    service.port = service_info.get('port')
                    service.status = service_info['status']
                    service.additional_ports = service_info.get('additional_ports')
                    service.details = service_info.get('details')
                    service.updated_at = datetime.utcnow()
                else:
                    # Create new service
                    service = DiscoveredService(
                        service_id=service_id,
                        name=service_info['name'],
                        service_type=service_info['service_type'],
                        host=service_info.get('host', 'localhost'),
                        port=service_info.get('port'),
                        status=service_info['status'],
                        additional_ports=service_info.get('additional_ports'),
                        details=service_info.get('details')
                    )
                    db.add(service)
                
                updated_services.append(service)
            
            # Remove services that no longer exist
            current_ids = {s['service_id'] for s in processed_services}
            for service_id, service in existing_services.items():
                if service_id not in current_ids:
                    db.delete(service)
            
            db.commit()
            return updated_services
        
        except Exception as e:
            logger.error(f"Error syncing services with database: {e}")
            db.rollback()
            return []
        finally:
            db.close()


# Create a singleton instance
service_discovery = UnifiedServiceDiscovery()
