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
        res = self.request_path('POST', '/user/logout')
        self.headers['Authorization']=''
    
    def request_path(self, method: str , path: str, params= None, data= None, headers= None, cookies= None, files= None, auth= None, timeout= None, allow_redirects= True, proxies= None, hooks= None, stream= None, verify= None, cert = None, json = None):
        kw = {"method":method, "url":BASE_URL+str(path), "params":params, "data":data, "headers":headers, "cookies":cookies, 
              "files":files, "auth": auth, "timeout":timeout, "allow_redirects": allow_redirects,
              "proxies":proxies, "hooks":hooks, "stream":stream, "verify":verify, "cert":cert, "json":json}
        return super().request(**{k:v for k,v in kw.items() if v})


class PreparedTestRequest:
    def __init__(self, method: str , path: str, params = None, data = None, headers = None, cookies = None, files = None, auth = None, timeout = None, allow_redirects = True, proxies = None, hooks = None, stream = None, verify = None, cert = None, json = None) -> None:
        self.kwargs = {}
        self.update(method, path, params, data, headers, cookies, files, auth, timeout, allow_redirects, proxies, hooks, stream, verify, cert, json)
    
    @property
    def path(self):
        return self.kwargs['path']
    
    @path.setter
    def path(self, value):
        self.kwargs['path'] = value
    
    def __call__(self, _with: Session, *args, **kwargs) -> Any:
        return self.execute(_with, *args, **kwargs)

    def update(self, 
               method: str = '', 
               path: str = '', 
               params = None, 
               data = None, 
               headers = None, 
               cookies = None, 
               files = None, 
               auth = None, 
               timeout = None, 
               allow_redirects = True, 
               proxies = None, 
               hooks = None, 
               stream = None, 
               verify = None, 
               cert = None, 
               json = None):
        newKw = {"method":method, "path":path, "params":params, "data":data, "headers":headers, "cookies":cookies, 
                            "files":files, "auth": auth, "timeout":timeout, "allow_redirects": allow_redirects,
                            "proxies":proxies, "hooks":hooks, "stream":stream, "verify":verify, "cert":cert, "json":json}
        self.kwargs.update({k:v for k,v in newKw.items() if v})
        return self

    def execute(self, _with: Session, *args, **kwargs):
        self.update(*args, **kwargs)
        return _with.request_path(**self.kwargs)

    def x(self, _with: Session, *args, **kwargs):
        "Shorthand for execute"
        return self.execute(_with, *args, **kwargs)


class PersistentStore:
    """A class which provides persistent store for test cases"""
    def store(self, key: str, value, useGlobal: bool = False):
        if not useGlobal:
            key = "%s.%s.%s" % (self.__class__.__module__, self.__class__.__name__, key)
        PS[key] = value
    
    def get(self, key: str, useGlobal: bool = False):
        if not useGlobal:
            key = "%s.%s.%s" % (self.__class__.__module__, self.__class__.__name__, key)
        return PS[key]
    
    def update(self, key: str, updater: dict, useGlobal: bool = False):
        if not useGlobal:
            key = "%s.%s.%s" % (self.__class__.__module__, self.__class__.__name__, key)
        PS[key].update(updater)
    
    def store_set(self, key: str, value, useGlobal: bool = False):
        return self.store(key, value, useGlobal)
    
    def store_get(self, key: str, useGlobal: bool = False):
        return self.get(key, useGlobal)
    
    def store_update(self, key: str, updater: dict, useGlobal: bool = False):
        self.update(key, updater, useGlobal)
