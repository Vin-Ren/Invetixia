from functools import lru_cache
import os
from enum import IntFlag
import secrets
from typing import Dict

import requests
import dotenv
from faker import Faker

dotenv.load_dotenv()

# Constants
BASE_URL = "http://127.0.0.1:8080"
SUPERUSER_CREDENTIALS = {"username":"superuser", "password":str(os.environ.get("SUPERUSER_PASSWORD",""))}
PS = PERSISTENT_STORE = {}
FAKE = Faker()

class Role(IntFlag):
    SUPER_ADMIN = 0b1000
    ADMIN = 0b100
    ORGANISATION_MANAGER = 0b10
    OBSERVER = 0b1
    PUBLIC = 0b0


def generate_credentials():
    credentials = {'username':FAKE.unique.name(), 'password':secrets.token_hex(16)}
    return credentials


def generate_create_user_input(role: Role, organisationName = None):
    if organisationName is None:
        organisationName = 'organisation-%s' % secrets.token_hex(4)
    return {**generate_credentials(), 'role': role.value, "organisationName": FAKE.unique.company()}

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
        
        self.credentials = credentials
        self.info = {}
        if credentials:
            self.login()
    
    def login(self):
        res = self.request_path('POST', '/user/login', json=self.credentials)
        if not res.ok: return res.ok
        self.headers['Authorization'] = f'Bearer {res.json()["accessToken"]}'
        
        res2 = self.request_path('GET', '/user/self', json=self.credentials)
        self.info = res2.json()['user']
        self.info['organisationName'] = self.info['organisationManaged']['name']
        return True
    
    def logout(self):
        res = self.request_path('POST', '/user/logout')
        if res.ok or res.status_code==403:
            self.headers['Authorization']=''
            return True
        else:
            return False
            # raise RuntimeError("Failed to logout, got response: %s" % res)
    
    def reauth(self):
        self.logout()
        return self.login()
    
    def request_path(self,
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
        kw = {"method":method, "url":BASE_URL+str(path), "params":params, "data":data, "headers":headers, "cookies":cookies, 
              "files":files, "auth": auth, "timeout":timeout, "allow_redirects": allow_redirects,
              "proxies":proxies, "hooks":hooks, "stream":stream, "verify":verify, "cert":cert, "json":json}
        kw = {k:v for k,v in kw.items() if v}
        res = super().request(**kw)
        if not res.ok:
            try:
                assert(res.json().get('message') is not None), res.json()
                if res.json()['message'][:4] in ["E101", "E102"]:
                    if self.login():
                        res = super().request(**kw)
            except requests.exceptions.JSONDecodeError:
                pass
        return res


class PreparedTestRequest:
    def __init__(self,
                 method: str, 
                 path: str, 
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
        self.kwargs = {}
        self.update(method, path, params, data, headers, cookies, files, auth, timeout, allow_redirects, proxies, hooks, stream, verify, cert, json)
    
    def __call__(self, *args, _with: Session = Session(), _path_formats = dict(), **kwargs):
        return self.execute(*args, _with=_with, _path_formats=_path_formats, **kwargs)

    @staticmethod
    def mergeKwargs(oldKwargs: dict = dict(), 
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
        resKw = oldKwargs.copy()
        resKw.update({k:v for k,v in newKw.items() if v})
        return resKw
    
    def update(self, *args, **kwargs):
        self.kwargs = self.mergeKwargs(self.kwargs, *args, **kwargs)
        return self

    def execute(self, *args, _with: Session = Session(), _path_formats = dict(), **kwargs):
        kwargs = self.mergeKwargs(self.kwargs, *args, **kwargs)
        kwargs['path'] = kwargs['path'] % _path_formats
        return _with.request_path(**kwargs)

    def x(self, *args, _with: Session = Session(), _path_formats = dict(), **kwargs):
        "Shorthand for execute"
        return self.execute(*args, _with=_with, _path_formats=_path_formats, **kwargs)


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
