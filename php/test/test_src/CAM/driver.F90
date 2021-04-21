! Driver for mo_usrrxt.F90
!
! Used to test custom rate constant functions
program driver

  use chem_mods,                       only : nfs, rxntot, gas_pcnst
  use mo_usrrxt,                       only : usrrxt_inti, usrrxt
  use mo_chem_utls,                    only:  get_reaction_labels, &
                                              get_species_labels, &
                                              get_invariant_species_labels, &
                                              number_of_reactions, &
                                              number_of_species, &
                                              number_of_invariant_species
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

  integer :: i_elem, i_level
  character(len=:), allocatable :: line

  tropchemlev(:) = 2
  rxt(:,:,:) = 0.0
  temp(:,:)  = 298.0_R8
  tempi(:,:) = 302.1_R8
  tempe(:,:) = 321.4_R8
  do i_elem = 1, nfs
    invariants(:,:,i_elem) = real(i_elem, kind=R8)
  end do
  h2ovmr(:,:)  = 0.02_R8
  pmid(:,:)    = 101325.0_R8
  m(:,:)       = 2.54e19_R8
  sulfate(:,:) = 1.0e-10_R8
  do i_elem = 1, gas_pcnst
    mmr(:,:,i_elem) = i_elem * 1.0e-8_R8
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
  call add_reaction_dependencies( )
  call usrrxt_inti( )

  ! calculate rates
  call usrrxt( rxt, temp, tempi, tempe, invariants, h2ovmr, pmid, m, sulfate, &
               mmr, relhum, strato_sad, tropchemlev, dlat, ncol, sad_trop, &
               reff_trop, cwat, mbar, pbuf )

  write(*,*) "Finished calculating rates from mo_usrrxt.F90"

  ! output conditions and rate constants
  open( unit = 7, file = "out/original_rate_constants.csv", &
        status = "replace", action = "write" )
  line = "level,temperature,pmid,h2ovmr,m,"//get_species_labels( )//","// &
         get_invariant_species_labels( )//","//get_reaction_labels( )
  write( 7, * ) line
  do i_level = 1, pver
    line = int_to_string( i_level )//","// &
           real_to_string( temp(   1, i_level ) )//","// &
           real_to_string( pmid(   1, i_level ) )//","// &
           real_to_string( h2ovmr( 1, i_level ) )//","// &
           real_to_string( m(      1, i_level ) )//","
    do i_elem = 1, number_of_species( )
      line = line//real_to_string( mmr( 1, i_level, i_elem ) )//","
    end do
    do i_elem = 1, number_of_invariant_species( )
      line = line//real_to_string( invariants( 1, i_level, i_elem ) )//","
    end do
    do i_elem = 1, number_of_reactions( )
      line = line//real_to_string( rxt( 1, i_level, i_elem ) )//","
    end do
    write( 7, * ) line( 1 : len( line ) - 1 )
  end do
  close( 7 )

contains

  ! For custom rate constant functions that are calculated from rate constants
  ! of standard reactions, these must be added to rate constant list
  subroutine add_reaction_dependencies( )
    use shr_kind_mod,                  only : R8 => shr_kind_r8
    call add_troe_reaction( 'tag_ACBZO2_NO2', &
                            9.7e-29_R8, -5.6_R8, 9.3e-12_R8, 1.5_R8, 0.6_R8 )
    call add_troe_reaction( 'tag_NO2_NO3', &
                            2.4e-30_R8, -3.0_R8, 1.6e-12_R8, -0.1_R8, 0.6_R8 )
    call add_troe_reaction( 'tag_NO2_HO2', &
                            1.9e-31_R8, -3.4_R8, 4.0e-12_R8, 0.3_R8, 0.6_R8 )
    call add_troe_reaction( 'tag_MCO3_NO2', &
                            9.7e-29_R8, -5.6_R8, 9.3e-12_R8, 1.5_R8, 0.6_R8 )
    call add_troe_reaction( 'tag_CH3CO3_NO2', &
                            9.7e-29_R8, -5.6_R8, 9.3e-12_R8, 1.5_R8, 0.6_R8 )
    call add_arrhenius_reaction( 'tag_CLO_CLO_M', &
                                 3e-11_R8, 0.0_R8, 2450.0_R8 )
  end subroutine add_reaction_dependencies

  ! Adds a Troe reaction in standard CAM format to the reaction list and
  ! calculates its rate constant
  subroutine add_troe_reaction( label, k0_A, k0_B, kinf_A, N, Fc )
    use mo_chem_utls,                  only : get_rxt_ndx
    use shr_kind_mod,                  only : R8 => shr_kind_r8
    character(len=*), intent(in) :: label
    real(R8), intent(in) :: k0_A, k0_B, kinf_A, N, Fc
    real(R8) :: k0, kinf
    integer :: i_rxn, i_level
    i_rxn = get_rxt_ndx( label )
    do i_level = 1, pver
      k0 = k0_A * (temp(1,i_level) / 300.0)**k0_B
      kinf = kinf_A
      rxt(1,i_level,i_rxn) = &
          k0 * m(1,i_level) / (1.0 + k0 * m(1,i_level) / kinf ) * &
          Fc**(1.0 / ( 1.0 + 1.0/N * (log10(k0 * m(1,i_level)/kinf))**2 ) )
    end do
  end subroutine add_troe_reaction

  ! Adds an Arrhenius reaction in standard CAM format to the reaction list and
  ! calculates its rate constant
  subroutine add_arrhenius_reaction( label, A, B, C )
    use mo_chem_utls,                  only : get_rxt_ndx
    use shr_kind_mod,                  only : R8 => shr_kind_r8
    character(len=*), intent(in) :: label
    real(R8), intent(in) :: A, B, C
    integer :: i_rxn
    i_rxn = get_rxt_ndx( label )
    rxt(1,:,i_rxn) = A * exp( C / temp(1,:) ) * (temp(1,:)/300.0)**B
  end subroutine add_arrhenius_reaction

  ! converts a 8-byte real to a string
  function real_to_string( val )
    use shr_kind_mod,                  only : R8 => shr_kind_r8
    character(len=:), allocatable :: real_to_string
    real(R8), intent(in) :: val
    character(len=60) :: ret_val
    write(ret_val, '(g30.20)') val
    real_to_string = trim( adjustl( ret_val ) )
  end function real_to_string

  ! converts an integer to a string
  function int_to_string( val )
    character(len=:), allocatable :: int_to_string
    integer, intent(in) :: val
    character(len=60) :: ret_val
    write(ret_val, '(i30)') val
    int_to_string = trim( adjustl( ret_val ) )
  end function int_to_string

end program driver
