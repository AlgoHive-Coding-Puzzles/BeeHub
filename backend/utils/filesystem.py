import os
import logging

logger = logging.getLogger(__name__)

def ensure_data_directory_exists():
    """
    Ensure that the data directory exists for storing the SQLite database.
    This should be called before any database operations.
    """
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    
    if not os.path.exists(data_dir):
        try:
            os.makedirs(data_dir)
            logger.info(f"Created data directory at: {data_dir}")
        except Exception as e:
            logger.error(f"Failed to create data directory: {e}")
            raise
    else:
        logger.debug(f"Data directory already exists at: {data_dir}")
    
    return data_dir
