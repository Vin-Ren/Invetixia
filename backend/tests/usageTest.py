import secrets
import requests

BASE_URL = "http://127.0.0.1:8080"


def _test(meth: str, path: str, toPrint = None, session: requests.Session | None = None, **kw):
    session = requests.Session() if not session else session
    
    print(*[e for e in [f"## Testing [HTTP {meth} {path}]", toPrint if toPrint else None] if e])
    
    path = '/'+path if not path.startswith('/') else path
    res = requests.Response()
    lines = []
    try:
        res = session.request(method=meth, url=BASE_URL+path, **kw)
        lines.append(f"Response: {res.status_code}")
        if res.status_code == 200: 
            if (resjson := res.json()): lines.append(f"Data={resjson}")
            if (rescook := res.cookies): lines.append(f"Cookies={rescook}")
        print("\n".join(['   '+e for e in lines]))
        print("")
        return res
    except requests.exceptions.ConnectionError:
        pass
    except Exception as e:
        pass
    print("\n".join(['   '+e for e in lines]))
    print("")
    return res


def printDivider(sectionName:str):
    print("#".center(50, '#'))
    print(f" {sectionName} ".center(50, '#'))


class TestSession(requests.Session):
    def __init__(self, *args, creds=None, **kw):
        super().__init__(*args, **kw)
        self.info = {}
        self.UUID = ""
        if creds:
            self.UUID = self.authenticate(creds)
    
    def test(self, meth: str, path: str, toPrint = None, **kw):
        return _test(meth, path, toPrint=toPrint, session=self, **kw)
    
    def authenticate(self, credentials):
        res = self.test('POST', '/user/login', "AUTHENTICATING TEST SESSION", json=credentials)
        self.headers['Authorization'] = f'Bearer {res.json()["accessToken"]}'
        
        res2 = self.test('GET', '/user/self', "GETTING SESSION INFO", json=credentials)
        self.info = res2.json()['user']


class Account:
    superuser = TestSession(creds={ 'username':'superuser', 'password':'cb3a6eb61d83be45e58de437c907782a' })
    admin = TestSession()
    public = TestSession()


printDivider("public")
Account.public.test('GET', '/', "should 404")
Account.public.test('GET', '/event', "should return events")

Account.public.test('GET', '/user', "should 403")
Account.public.test('GET', '/user/roles', "should return roles")
Account.public.test('GET', '/user/refreshToken', "should 401")


printDivider("superuser")
res = Account.superuser.test('GET', '/user', "should 200")
Account.superuser.test('GET', '/user/self', "should 200")

# for e in res.json()['users']:
#     if e['UUID'] == Account.superuser.info['UUID']: pass
#     Account.superuser.test('DELETE', '/user/delete', "should 201", json=e)


admin_creds = {"username": secrets.token_hex(10), "password": secrets.token_hex(16)}
Account.superuser.test('POST', '/user/create', " should be successful", json={**admin_creds, "organisationName": "adminDefaultOrganisation", "role":4})


printDivider("admin")
Account.admin.authenticate(admin_creds)
Account.admin.test('GET', '/user/self', "should 200")

Account.admin.test('POST', '/user/logout', "Logging out")

Account.admin.test('GET', '/user/self', "should 403")
Account.admin.authenticate(admin_creds)
