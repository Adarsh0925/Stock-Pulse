import time
from typing import Dict, Any, Optional

class SimpleCache:
    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self.store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self.store:
            item = self.store[key]
            if time.time() - item["timestamp"] < self.ttl:
                return item["data"]
            else:
                del self.store[key]
        return None

    def set(self, key: str, data: Any):
        self.store[key] = {
            "timestamp": time.time(),
            "data": data
        }

# Global cache instances
market_cache = SimpleCache(ttl_seconds=30)
quote_cache = SimpleCache(ttl_seconds=30)
news_cache = SimpleCache(ttl_seconds=300)
fundamentals_cache = SimpleCache(ttl_seconds=600)
history_cache = SimpleCache(ttl_seconds=300)
