! Stub modules for testing mo_usrrxt.F90

module shr_kind_mod
  implicit none
  integer, parameter :: shr_kind_r8 = selected_real_kind(12)
end module shr_kind_mod

module cam_logfile
  implicit none
  integer, parameter :: iulog = 6
end module cam_logfile

module ppgrid
  implicit none
  integer, parameter :: pver  = 3 ! Number of vertical levels
  integer, parameter :: pcols = 1 ! Max number of columns
end module ppgrid

module mo_chem_utls
  implicit none
  type :: string_t
    character(len=:), allocatable :: val_
  end type string_t
  type(string_t), allocatable :: reaction_labels(:)
  type(string_t), allocatable :: species_labels(:)
  type(string_t), allocatable :: invariant_species_labels(:)
contains
  ! find or add a string to an array of strings, and return its index
  integer function find_or_add( string, array ) result( array_index )
    type(string_t), intent(in) :: string
    type(string_t), allocatable, intent(inout) :: array(:)
    integer :: i_array
    if( .not. allocated( array ) ) then
      allocate( array( 1 ) )
      array( 1 ) = string
    else
      do i_array = 1, size( array )
        if( array( i_array )%val_ .eq. string%val_ ) then
          array_index = i_array
          return
        end if
      end do
      array = [ array, string ]
    end if
    array_index = size( array )
  end function find_or_add

  ! get a unique reaction index
  integer function get_rxt_ndx( label ) result( reaction_index )
    character(len=*), intent(in) :: label
    type(string_t) :: str_label
    str_label%val_ = trim( label )
    reaction_index = find_or_add( str_label, reaction_labels )
  end function get_rxt_ndx

  ! get a unique species index
  integer function get_spc_ndx( label ) result( species_index )
    character(len=*), intent(in) :: label
    type(string_t) :: str_label
    str_label%val_ = trim( label )
    species_index = find_or_add( str_label, species_labels )
  end function get_spc_ndx

  ! get a unique invariant species index
  integer function get_inv_ndx( label ) result( species_index )
    character(len=*), intent(in) :: label
    type(string_t) :: str_label
    str_label%val_ = trim( label )
    species_index = find_or_add( str_label, invariant_species_labels )
  end function get_inv_ndx
end module mo_chem_utls

module spmd_utils
  implicit none
  logical :: masterproc = .true.
end module spmd_utils

module mo_constants
  use shr_kind_mod,                    R8 => shr_kind_r8
  implicit none
  real(R8), parameter :: pi = 3.14159265358979323846_R8  ! pi
  real(R8), parameter :: avogadro = 6.02214e23_R8        ! Avogadro's number ~ molecules/mole
  real(R8), parameter :: boltz_cgs = 1.38065e-16_R8      ! Boltzmann's constant ~ erg/K/molecule
  real(R8), parameter :: rgas = 6.02214e26_R8 * 1.38065e-23_R8 * 1.0e-3_R8 ! Gas constant ~ J/K/mol
end module mo_constants

module chem_mods
  implicit none
  integer, parameter :: nfs = 100         ! number of fixed species
  integer, parameter :: rxntot = 10000    ! number of reactions
  integer, parameter :: gas_pcnst = 10000 ! number of gas-phase species
  integer, parameter :: indexm = 1        ! index of total atm density in invariant array
end module chem_mods

module mo_setinv
  use mo_chem_utls,                    only : get_inv_ndx
  implicit none
  integer :: o2_ndx, h2o_ndx
contains
  subroutine initialize( )
    o2_ndx  = get_inv_ndx( 'O2' )
    h2o_ndx = get_inv_ndx( 'H2O' )
  end subroutine initialize
end module mo_setinv

module physics_buffer
  implicit none
  type :: physics_buffer_desc
    private
  end type physics_buffer_desc
end module physics_buffer

module carma_flags_mod
  implicit none
  ! If .true. then CARMA sulfate surface area density used in heterogeneous chemistry
  logical, parameter :: carma_hetchem_feedback = .false.
end module carma_flags_mod

module aero_model
  implicit none
contains
  !-------------------------------------------------------------------------
  ! provides wet tropospheric aerosol surface area info for modal aerosols
  ! called from mo_usrrxt
  !-------------------------------------------------------------------------
  subroutine aero_model_surfarea( &
                  mmr, radmean, relhum, pmid, temp, strato_sad, sulfate, rho, ltrop, &
                  dlat, het1_ndx, pbuf, ncol, sfc, dm_aer, sad_trop, reff_trop )
    use physics_buffer,                  only : physics_buffer_desc
    use shr_kind_mod,                    only : r8 => shr_kind_r8
    ! dummy args
    real(r8), intent(in)    :: pmid(:,:)
    real(r8), intent(in)    :: temp(:,:)
    real(r8), intent(in)    :: mmr(:,:,:)
    real(r8), intent(in)    :: radmean      ! mean radii in cm
    real(r8), intent(in)    :: strato_sad(:,:)
    integer,  intent(in)    :: ncol
    integer,  intent(in)    :: ltrop(:)
    real(r8), intent(in)    :: dlat(:)                    ! degrees latitude
    integer,  intent(in)    :: het1_ndx
    real(r8), intent(in)    :: relhum(:,:)
    real(r8), intent(in)    :: rho(:,:) ! total atm density (/cm^3)
    real(r8), intent(in)    :: sulfate(:,:)
    type(physics_buffer_desc), pointer :: pbuf(:)

    real(r8), intent(inout) :: sfc(:,:,:)
    real(r8), intent(inout) :: dm_aer(:,:,:)
    real(r8), intent(inout) :: sad_trop(:,:)
    real(r8), intent(out)   :: reff_trop(:,:)

    sfc(:,:,:)       = 1.0e-10 ! surface area density by mode [cm2 cm-3]
    dm_aer(:,:,:)    = 1.0e-5  ! aerosol diameter by mode? [cm]
    sad_trop(:,:)    = 1.0e-9  ! surface area density [cm2 cm-3]
    reff_trop(:,:)   = 0.5e-5  ! effective radius? [cm]
  end subroutine aero_model_surfarea
end module aero_model

module rad_constituents
  implicit none
contains
  subroutine rad_cnst_get_info( list_idx, nmodes )
    integer,           intent(in)  :: list_idx ! index of the climate or a diagnostic list
    integer, optional, intent(out) :: nmodes   ! number of modes
    nmodes = 4
  end subroutine rad_cnst_get_info
end module rad_constituents

