## Running tests on cafe-devel ##


Navigate to the `php/test/` folder and run:

```
mkdir build
cd build
export LD_LIBRARY_PATH="/opt/local/lib64:/opt/local/lib"
export PATH="/opt/local/bin:$PATH"
cmake -D CMAKE_Fortran_COMPILER="/opt/local/bin/gfortran" ..
make
make test
```
