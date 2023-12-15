import pytest
from commons import PreparedTestRequest

class Endpoint:
    base = '/event'

class Test:
    base = PreparedTestRequest("GET", Endpoint.base)

def test_superuser_get_info(superuser):
    res = Test.base.x(_with=superuser)
    assert (res.ok)

def test_admin_get_info(admin):
    res = Test.base.x(_with=admin)
    assert (res.ok)

def test_organisation_manager_get_info(organisation_manager):
    res = Test.base.x(_with=organisation_manager)
    assert (res.ok)

def test_public_get_info(public):
    res = Test.base.x(_with=public)
    assert (res.ok)
