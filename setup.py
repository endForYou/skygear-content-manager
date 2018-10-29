import sys
from os import path

from setuptools import find_packages, setup
from setuptools.command.test import test as TestCommand

README = path.abspath(path.join(path.dirname(__file__), 'README.md'))

classifiers = [
    'License :: Other/Proprietary License',
    'Intended Audience :: Developers',
    'Programming Language :: Python :: 3',
    'Programming Language :: Python :: 3.3',
    'Programming Language :: Python :: 3.4',
    'Operating System :: POSIX',
    'Operating System :: MacOS :: MacOS X',
    'Environment :: Web Environment',
    'Development Status :: 3 - Alpha',
]

class PyTest(TestCommand):
    def finalize_options(self):
        TestCommand.finalize_options(self)
        self.test_args = ['skygear_content_manager']
        self.test_suite = True
    def run_tests(self):
        #import here, cause outside the eggs aren't loaded
        import pytest
        errno = pytest.main(self.test_args)
        sys.exit(errno)

setup(
      name='skygear-content-manager',
      version='0.1.0',
      packages=find_packages(),
      description='CMS Plugin for Skygear',
      long_description=open(README).read(),
      classifiers=classifiers,
      author='Rick Mak',
      author_email='rick.mak@gmail.com',
      url='https://github.com/oursky/skygear-content-manager',
      license='Other/Proprietary License',
      install_requires=[
            'arrow>=0.12.1',
            'humanfriendly>=4.16.1',
            'marshmallow>=3.0.0b7,<=3.0.0b18',
            'python-jose>=2.0',
            'requests>=2.18.4',
            'ruamel.yaml>=0.15.40',
            'skygear>=1.1.1',
      ],
      cmdclass= {'test': PyTest},
      tests_require=[
            'pytest',
      ],
)
