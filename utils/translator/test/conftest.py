import pytest

# https://docs.pytest.org/en/6.2.x/example/simple.html?highlight=addoption#pass-different-values-to-a-test-function-depending-on-command-line-options
def pytest_addoption(parser):
    parser.addoption('--translator', action='store', default=None, help='Chosen translator for test run')
    parser.addoption('--target-lang', action='store', default='ENG', help='Target language for translator test run')
    parser.addoption('--text', action='store', default=None, help='Text to be used for translation test run')
    parser.addoption('--count', action='store', type=int, default=1, help='Amount of times the test should be repeated')

@pytest.fixture
def translator(request):
    return request.config.getoption('--translator')

@pytest.fixture
def tgt_lang(request):
    return request.config.getoption('--target-lang')
    
@pytest.fixture
def text(request):
    return request.config.getoption('--text')

@pytest.fixture
def count(request):
    return request.config.getoption('--count')
