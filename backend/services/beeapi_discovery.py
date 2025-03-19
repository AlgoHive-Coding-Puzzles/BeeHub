from config import settings
import logging
import threading
import time
from typing import List, Dict, Any

from services.discovery import UnifiedServiceDiscovery

logger = logging.getLogger(__name__)

class BeeApiDiscoveryService:
    """Service to discover BeeAPI instances"""
    
    def __init__(self):
        self.discovery_service = UnifiedServiceDiscovery()
        self.discovered_apis = []
        self.running = False
        self.discovery_thread = None
    
    def start_discovery(self):
        """Start the discovery service in a background thread"""
        if not settings.DISCOVERY_ENABLED:
            logger.info("BeeAPI discovery is disabled")
            return
            
        if self.running:
            logger.warning("Discovery service is already running")
            return
            
        self.running = True
        self.discovery_thread = threading.Thread(target=self._discovery_loop)
        self.discovery_thread.daemon = True
        self.discovery_thread.start()
        logger.info(f"BeeAPI discovery started, scanning ports {settings.DISCOVERY_PORT_RANGE}")
    
    def stop_discovery(self):
        """Stop the discovery service"""
        self.running = False
        if self.discovery_thread:
            self.discovery_thread.join(timeout=5.0)
        # Ensure resources are released when stopping
        if hasattr(self.discovery_service, 'close') and callable(getattr(self.discovery_service, 'close')):
            self.discovery_service.close()
        logger.info("BeeAPI discovery stopped")
    
    def _discovery_loop(self):
        """Background loop that periodically discovers services"""
        while self.running:
            try:
                self._discover_services()
                # Sleep for the configured interval
                time.sleep(settings.DISCOVERY_REFRESH_INTERVAL)
            except Exception as e:
                logger.error(f"Error in discovery loop: {e}")
                time.sleep(10)  # Sleep before retrying after error
    
    def _discover_services(self):
        """Discover BeeAPI services"""
        try:
            services = self.discovery_service.discover_services(target_ports=settings.DISCOVERY_PORT_RANGE)
            
            # Filter for BeeAPI services
            beeapi_services = []
            for service in services:
                # Check if it's a Docker service with BeeAPI label
                if service['service_type'] == 'docker' and service.get('details', {}).get('labels', {}).get('algohive.service.type') == settings.DISCOVERY_SERVICE_TYPE:
                    beeapi_services.append(service)
                # For local services, we rely on port range only
                elif service['service_type'] == 'local' and service['port'] in settings.DISCOVERY_PORT_RANGE:
                    beeapi_services.append(service)
                    
            self.discovered_apis = beeapi_services
            logger.info(f"Discovered {len(beeapi_services)} BeeAPI services")
        except Exception as e:
            logger.error(f"Error in discovery process: {e}")
            # Make sure to release any potential DB resources on error
            if hasattr(self.discovery_service, 'close') and callable(getattr(self.discovery_service, 'close')):
                self.discovery_service.close()
    
    def get_discovered_apis(self) -> List[Dict[str, Any]]:
        """Return the list of discovered BeeAPI services"""
        return self.discovered_apis

# Create singleton instance
beeapi_discovery = BeeApiDiscoveryService()
