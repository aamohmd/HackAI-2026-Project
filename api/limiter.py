from slowapi import Limiter
from slowapi.util import get_remote_address

# Create a limiter instance
# get_remote_address uses the client's IP as the key
limiter = Limiter(key_func=get_remote_address)
