from functools import lru_cache
import os
from enum import IntFlag
import secrets
from typing import Dict

import requests
import dotenv

dotenv.load_dotenv()

# Constants
BASE_URL = "http://127.0.0.1:8080"
SUPERUSER_CREDENTIALS = {"username":"superuser", "password":str(os.environ.get("SUPERUSER_PASSWORD",""))}
PS = PERSISTENT_STORE = {}

class Role(IntFlag):
    SUPER_ADMIN = 0b1000
    ADMIN = 0b100
    ORGANISATION_MANAGER = 0b10
    OBSERVER = 0b1


def generate_credentials():
    credentials = {'username':secrets.token_hex(4), 'password':secrets.token_hex(16)}
    return credentials


def generate_create_user_input(role: Role, organisationName = None):
    if organisationName is None:
        organisationName = 'organisation-%s' % secrets.token_hex(4)
    return {**generate_credentials(), 'role': role.value, "organisationName": organisationName}

@lru_cache(maxsize=None)
def generate_many_create_user_input(role:Role, count=1):
    "Generate many create user input, but with persistence within a session"
    if count==0: return []
    return generate_many_create_user_input(role, count-1)+[generate_create_user_input(role)]


def generate_random_hex(prefix: str = '', randomLength: int = 8):
    return prefix+secrets.token_hex(randomLength)

@lru_cache(maxsize=None)
def generate_many_random_hex(count=1, prefix: str = '', randomLength: int = 8):
    "Generate many random hex, but with persistence within a session"
    if count==0: return []
    return generate_many_random_hex(count-1, prefix)+[generate_random_hex(prefix, randomLength)]


class Session(requests.Session):
    def __init__(self, *args, credentials: Dict[str, str] | None = None, **kw):
        super().__init__(*args, **kw)
        
        self.info = {}
        if credentials:
            self.login(credentials)
    
    def login(self, credentials: Dict[str, str]):
        res = self.request_path('POST', '/user/login', json=credentials)
        self.headers['Authorization'] = f'Bearer {res.json()["accessToken"]}'
        
        res2 = self.request_path('GET', '/user/self', json=credentials)
        self.info = res2.json()['user']
    
    def logout(self):
        if self.request_path('POST', '/user/logout').ok:
            self.headers['Authorization']=''
        else:
            raise ConnectionError("FAILED TO LOGOUT")
    
    def request_path(self, method: str , path: str, params= None, data= None, headers= None, cookies= None, files= None, auth= None, timeout= None, allow_redirects= True, proxies= None, hooks= None, stream= None, verify= None, cert = None, json = None):
        return super().request(method, BASE_URL+str(path), params, data, headers, cookies, files, auth, timeout, allow_redirects, proxies, hooks, stream, verify, cert, json)


class PersistentStore:
    """A class which provides persistent store for test cases"""
    def store(self, key: str, value, to_global: bool = False):
        if to_global:
            PS[key] = value
        else:
            PS["%s.%s.%s" % (self.__class__.__module__, self.__class__.__name__, key)] = value
    
    def get(self, key: str, to_global: bool = False):
        if to_global:
            return PS[key]
        return PS["%s.%s.%s" % (self.__class__.__module__, self.__class__.__name__, key)]
    
    def store_set(self, key: str, value, to_global: bool = False):
        return self.store(key, value)
    
    def store_get(self, key: str, to_global: bool = False):
        return self.get(key)
