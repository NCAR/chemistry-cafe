! Driver for mo_usrrxt.F90
!
! Used to test custom rate constant functions
program driver

  use chem_mods,                       only : nfs, rxntot, gas_pcnst
  use mo_usrrxt,                       only : usrrxt_inti, usrrxt
  use mo_setinv,                       only : mo_setinv_init => initialize
  use physics_buffer,                  only : physics_buffer_desc
  use ppgrid,                          only : pver, pcols
  use shr_kind_mod,                    only : R8 => shr_kind_r8

  integer, parameter :: ncol = pcols      ! what is the difference between these?
  integer :: tropchemlev(pcols)           ! trop/strat reaction separation vertical index
  real(R8) :: rxt(ncol, pver, rxntot)     ! gas phase rates
  real(R8) :: temp(pcols, pver)           ! temperature (K); neutral temperature
  real(R8) :: tempi(pcols, pver)          ! ionic temperature (K); only used if ion chemistry
  real(R8) :: tempe(pcols, pver)          ! electronic temperature (K); only used if ion chemistry
  real(R8) :: invariants(ncol, pver, nfs) ! invariants density(/cm^3)
  real(R8) :: h2ovmr(ncol, pver)          ! water vapor (mol/mol)
  real(R8) :: pmid(pcols, pver)           ! midpoint pressure (Pa)
  real(R8) :: m(ncol, pver)               ! total atmospheric density (/cm^3)
  real(R8) :: sulfate(ncol, pver)         ! sulfate aerosol (mol/mol)
  real(R8) :: mmr(pcols, pver, gas_pcnst) ! species concentrations (kg/kg)
  real(R8) :: relhum(ncol, pver)          ! relative humidity
  real(R8) :: strato_sad(pcols, pver)     ! stratospheric aerosol sad (1/cm)
  real(R8) :: dlat(1)                     ! degrees latitude
  real(R8) :: sad_trop(pcols, pver)       ! tropospheric surface area density (cm2/cm3)
  real(R8) :: reff_trop(pcols, pver)      ! tropospheric effective radius (cm)
  real(R8) :: cwat(ncol, pver)            ! PJC Condensed Water (liquid+ice) (kg/kg)
  real(R8) :: mbar(ncol, pver)            ! PJC Molar mass of air (g/mol)
  type(physics_buffer_desc), pointer :: pbuf(:)

  integer :: i

  tropchemlev(:) = 2
  rxt(:,:,:) = 0.0
  temp(:,:)  = 298.0_R8
  tempi(:,:) = 302.1_R8
  tempe(:,:) = 321.4_R8
  do i = 1, nfs
    invariants(:,:,i) = real(i, kind=R8)
  end do
  h2ovmr(:,:)  = 0.02_R8
  pmid(:,:)    = 101325.0_R8
  m(:,:)       = 2.54e19_R8
  sulfate(:,:) = 1.0e-10_R8
  do i = 1, gas_pcnst
    mmr(:,:,i) = i * 1.0e-8_R8
  end do
  relhum(:,:)     = 0.9_R8
  strato_sad(:,:) = 1.0e-7_R8
  dlat(:)         = 10.0_R8
  sad_trop(:,:)   = 2.0e-6_R8
  reff_trop(:,:)  = 5.0e-6_R8
  cwat(:,:)       = 2.0e-8_R8
  mbar(:,:)       = 28.97_R8
  allocate( pbuf( 1 ) )

  ! initialize things
  call mo_setinv_init( )
  call usrrxt_inti( )

  ! calculate rates
  call usrrxt( rxt, temp, tempi, tempe, invariants, h2ovmr,  &
               pmid, m, sulfate, mmr, relhum, strato_sad, &
               tropchemlev, dlat, ncol, sad_trop, reff_trop, cwat, mbar, pbuf )

  write(*,*) "Finished calculating rates from mo_usrrxt.F90"

end program driver
