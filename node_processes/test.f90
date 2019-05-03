% cat atomics.cuf 

module atomictests 
contains attributes(global)

  subroutine testatomicadd( a ) 
    integer, device :: a 
    i = threadIdx%x 
    istat = atomicadd(a, i) 
  return 
  end subroutine testatomicadd 

end module atomictests 

program t 
  use atomictests 
  integer, allocatable, device :: n
  integer m 
  allocate(n) 
  n = 0 
  call testatomicadd <<1,5>> (n) 
  m = n 
  print *, m 
end 

% pgf90 atomics.cuf -V10.9; a.out
