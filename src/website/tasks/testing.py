from invoke import run, task


@task(name='lint-js')
def lint_js(context):
    """lint the javascript files"""
    run('bin/tests/check_prettier_errors.sh --all', echo=True)
    run("eslint --report-unused-disable-directives --ext .js,.jsx,.ts,.tsx frontend", echo=True)


@task(name='lint-py')
def lint_py(context):
    run('flake8 --config=.flake8 *.py .', echo=True)


@task(name='test-py')
def test_python(context):
    run('pytest --cov=backend/ && coverage report', echo=True)
