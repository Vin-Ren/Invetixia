import os
from enum import IntFlag
import secrets
from typing import Dict

import requests

# Constants
BASE_URL = "http://127.0.0.1:8080"
SUPERUSER_CREDENTIALS = {"username":"superuser", "password":str(os.environ.get("SUPERUSER_PASSWORD",""))}


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
