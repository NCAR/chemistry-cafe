
module mo_imp_sol

  use shr_kind_mod, only : r8 => shr_kind_r8
  use chem_mods,    only : clscnt4, gas_pcnst, clsmap
  use cam_logfile,  only : iulog

  implicit none
  private
  public :: imp_slv_inti, imp_sol
  save

  real(r8), parameter :: rel_err = 1.e-3_r8
  real(r8), parameter :: high_rel_err = 1.e-4_r8
  !-----------------------------------------------------------------------
  ! Newton-Raphson iteration limits
  !-----------------------------------------------------------------------
  integer, parameter  :: itermax   = 11
  integer, parameter  :: cut_limit = 5
  integer, parameter  :: vec_len   = 64
  real(r8), parameter :: sol_min   = 1.e-20_r8
  real(r8), parameter :: small     = 1.e-40_r8

  real(r8) :: epsilon(clscnt4)
  logical  :: factor(itermax)

contains

  subroutine imp_slv_inti
    !-----------------------------------------------------------------------
    ! ... Initialize the implict solver
    !-----------------------------------------------------------------------
    use mo_chem_utls, only : get_spc_ndx

    implicit none

    !-----------------------------------------------------------------------
    ! ... Local variables
    !-----------------------------------------------------------------------
    integer  :: m, ox_ndx, o3a_ndx
    real(r8) :: eps(gas_pcnst)

    factor(:) = .true.
    eps(:) = rel_err

    ox_ndx = get_spc_ndx( 'OX' )
    if( ox_ndx < 1 ) then
       ox_ndx = get_spc_ndx( 'O3' )
    end if
    if( ox_ndx > 0 ) then
       eps(ox_ndx) = high_rel_err
    end if
    m = get_spc_ndx( 'NO' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'NO2' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'NO3' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'HNO3' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'HO2NO2' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'N2O5' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'OH' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'HO2' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    o3a_ndx = get_spc_ndx( 'O3A' )
    if( o3a_ndx > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'XNO' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'XNO2' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'XNO3' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'XHNO3' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'XHO2NO2' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'XNO2NO3' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    m = get_spc_ndx( 'NO2XNO3' )
    if( m > 0 ) then
       eps(m) = high_rel_err
    end if
    do m = 1,clscnt4
       epsilon(m) = eps(clsmap(m,4))
    end do

  end subroutine imp_slv_inti

  subroutine imp_sol( base_sol, reaction_rates, het_rates, extfrc, delt, &
                      ncol,nlev, lchnk, prod_out, loss_out )
    !-----------------------------------------------------------------------
    !      	... imp_sol advances the volumetric mixing ratio
    !           forward one time step via the fully implicit euler scheme.
    !           this source is meant for vector architectures such as the
    !           nec sx6 and cray x1
    !-----------------------------------------------------------------------

    use chem_mods,     only : rxntot, extcnt, nzcnt, permute, cls_rxt_cnt
    use mo_tracname,   only : solsym
    use mo_lin_matrix, only : linmat
    use mo_nln_matrix, only : nlnmat
    use mo_lu_factor,  only : lu_fac
    use mo_lu_solve,   only : lu_slv
    use mo_prod_loss,  only : imp_prod_loss
    use mo_indprd,     only : indprd
    use time_manager,  only : get_nstep
    use perf_mod,      only : t_startf, t_stopf

    implicit none

    !-----------------------------------------------------------------------
    ! ... dummy args
    !-----------------------------------------------------------------------
    integer,  intent(in) :: ncol ! columns in chunck
    integer,  intent(in) :: nlev
    integer,  intent(in) :: lchnk ! chunk id
    real(r8), intent(in) :: delt ! time step (s)

    real(r8), intent(in) :: reaction_rates(ncol*nlev,max(1,rxntot)) ! rxt rates (1/cm^3/s)
    real(r8), intent(in) :: extfrc(ncol*nlev,max(1,extcnt))         ! external in-situ forcing (1/cm^3/s)
    real(r8), intent(in) :: het_rates(ncol*nlev,max(1,gas_pcnst))   ! washout rates (1/s)
    real(r8), intent(inout) :: base_sol(ncol*nlev,gas_pcnst)        ! species mixing ratios (vmr)

    real(r8), intent(out) :: prod_out(ncol*nlev,max(1,clscnt4))
    real(r8), intent(out) :: loss_out(ncol*nlev,max(1,clscnt4))

    !-----------------------------------------------------------------------
    ! ... local variables
    !-----------------------------------------------------------------------
    integer  ::  nr_iter
    integer  ::  ofl
    integer  ::  ofu
    integer  ::  bndx                                                      ! base index
    integer  ::  cndx                                                      ! class index
    integer  ::  pndx                                                      ! permuted class index
    integer  ::  m
    integer  ::  fail_cnt
    integer  ::  cut_cnt
    integer  ::  stp_con_cnt
    integer  ::  nstep
    real(r8) ::  interval_done
    real(r8) ::  dt
    real(r8) ::  dti
    real(r8) ::  max_delta(max(1,clscnt4))
    real(r8) ::  sys_jac(ncol*nlev,max(1,nzcnt))
    real(r8) ::  lin_jac(ncol*nlev,max(1,nzcnt))
    real(r8) ::  solution(ncol*nlev,max(1,clscnt4))
    real(r8) ::  forcing(ncol*nlev,max(1,clscnt4))
    real(r8) ::  iter_invariant(ncol*nlev,max(1,clscnt4))
    real(r8) ::  prod(ncol*nlev,max(1,clscnt4))
    real(r8) ::  loss(ncol*nlev,max(1,clscnt4))
    real(r8) ::  ind_prd(ncol*nlev,max(1,clscnt4))
    real(r8) ::  sbase_sol(ncol*nlev,gas_pcnst)
    real(r8) ::  wrk(ncol*nlev)
    logical  ::  convergence
    logical  ::  spc_conv(ncol*nlev,max(1,clscnt4))
    logical  ::  cls_conv(ncol*nlev)
    logical  ::  converged(max(1,clscnt4))
    integer  ::  chnkpnts  ! total spatial points in chunk; ncol*ncol
    logical  ::  diags_out(ncol*nlev,max(1,clscnt4))

    chnkpnts = ncol*nlev
    prod_out = 0._r8
    loss_out = 0._r8
    diags_out = .false.

    !-----------------------------------------------------------------------      
    !        ... class independent forcing
    !-----------------------------------------------------------------------      
    if( cls_rxt_cnt(1,4) > 0 .or. extcnt > 0 ) then
       call indprd( 4, ind_prd, clscnt4, base_sol, extfrc, &
            reaction_rates, chnkpnts )
    else
       do m = 1,clscnt4
          ind_prd(:,m) = 0._r8
       end do
    end if

    ofl = 1
    chnkpnts_loop : do 
       ofu = min( chnkpnts,ofl + vec_len - 1 )
       do m = 1,gas_pcnst
          sbase_sol(ofl:ofu,m) = base_sol(ofl:ofu,m)
       end do
       !-----------------------------------------------------------------------      
       !        ... time step loop
       !-----------------------------------------------------------------------      
       dt            = delt
       cut_cnt       = 0
       fail_cnt      = 0
       stp_con_cnt   = 0
       interval_done = 0._r8
       time_step_loop : do
          dti = 1._r8 / dt
          !-----------------------------------------------------------------------      
          !        ... transfer from base to class array
          !-----------------------------------------------------------------------      
          do cndx = 1,clscnt4
             bndx = clsmap(cndx,4)
             pndx = permute(cndx,4)
             solution(ofl:ofu,pndx) = base_sol(ofl:ofu,bndx)
          end do
          !-----------------------------------------------------------------------      
          !        ... set the iteration invariant part of the function f(y)
          !-----------------------------------------------------------------------      
          if( cls_rxt_cnt(1,4) > 0 .or. extcnt > 0 ) then
             do m = 1,clscnt4
                iter_invariant(ofl:ofu,m) = dti * solution(ofl:ofu,m) + ind_prd(ofl:ofu,m)
             end do
          else
             do m = 1,clscnt4
                iter_invariant(ofl:ofu,m) = dti * solution(ofl:ofu,m)
             end do
          end if
          !-----------------------------------------------------------------------      
          !        ... the linear component
          !-----------------------------------------------------------------------      
          if( cls_rxt_cnt(2,4) > 0 ) then
             call t_startf( 'lin_mat' )
             call linmat( ofl, ofu, chnkpnts, lin_jac, base_sol, &
                  reaction_rates, het_rates )
             call t_stopf( 'lin_mat' )
          end if
          !=======================================================================
          !        the newton-raphson iteration for f(y) = 0
          !=======================================================================
          cls_conv(ofl:ofu) = .false.
          iter_loop : do nr_iter = 1,itermax
             !-----------------------------------------------------------------------      
             !        ... the non-linear component
             !-----------------------------------------------------------------------      
             if( factor(nr_iter) ) then
                call t_startf( 'nln_mat' )
                call nlnmat( ofl, ofu, chnkpnts, sys_jac, base_sol, &
                     reaction_rates, lin_jac, dti )
                call t_stopf( 'nln_mat' )
                !-----------------------------------------------------------------------      
                !         ... factor the "system" matrix
                !-----------------------------------------------------------------------      
                call t_startf( 'lu_fac' )
                call lu_fac( ofl, ofu, chnkpnts, sys_jac )
                call t_stopf( 'lu_fac' )
             end if
             !-----------------------------------------------------------------------      
             !   	... form f(y)
             !-----------------------------------------------------------------------      
             call t_startf( 'prod_loss' )
             call imp_prod_loss( ofl, ofu, chnkpnts, prod, loss, &
                  base_sol, reaction_rates, het_rates )
             call t_stopf( 'prod_loss' )
             do m = 1,clscnt4
                forcing(ofl:ofu,m) = solution(ofl:ofu,m)*dti &
                                   - (iter_invariant(ofl:ofu,m) + prod(ofl:ofu,m) - loss(ofl:ofu,m))
             end do
             !-----------------------------------------------------------------------      
             !         ... solve for the mixing ratio at t(n+1)
             !-----------------------------------------------------------------------      
             call t_startf( 'lu_slv' )
             call lu_slv( ofl, ofu, chnkpnts, sys_jac, forcing )
             call t_stopf( 'lu_slv' )
             do m = 1,clscnt4
                where( .not. cls_conv(ofl:ofu) )
                   solution(ofl:ofu,m) = solution(ofl:ofu,m) + forcing(ofl:ofu,m)
                elsewhere
                   forcing(ofl:ofu,m)  = 0._r8
                endwhere
             end do
             !-----------------------------------------------------------------------      
             !    	... convergence measures and test
             !-----------------------------------------------------------------------      
             conv_chk : if( nr_iter > 1 ) then
                !-----------------------------------------------------------------------      
                !    	... check for convergence
                !-----------------------------------------------------------------------      
                do cndx = 1,clscnt4
                   pndx = permute(cndx,4)
                   bndx = clsmap(cndx,4)
                   where( abs( solution(ofl:ofu,pndx) ) > sol_min )
                      wrk(ofl:ofu) = abs( forcing(ofl:ofu,pndx)/solution(ofl:ofu,pndx) )
                   elsewhere
                      wrk(ofl:ofu) = 0._r8
                   endwhere
                   max_delta(cndx)        = maxval( wrk(ofl:ofu) )
                   solution(ofl:ofu,pndx) = max( 0._r8,solution(ofl:ofu,pndx) )
                   base_sol(ofl:ofu,bndx) = solution(ofl:ofu,pndx)
                   where( abs( forcing(ofl:ofu,pndx) ) > small )
                      spc_conv(ofl:ofu,cndx) = abs(forcing(ofl:ofu,pndx)) <= epsilon(cndx)*abs(solution(ofl:ofu,pndx))
                   elsewhere
                      spc_conv(ofl:ofu,cndx) =  .true.
                   endwhere
                   where( spc_conv(ofl:ofu,cndx) .and. .not.diags_out(ofl:ofu,cndx) )
                      ! capture output production and loss diagnostics at converged ponits 
                      prod_out(ofl:ofu,cndx) = prod(ofl:ofu,cndx) + ind_prd(ofl:ofu,cndx)
                      loss_out(ofl:ofu,cndx) = loss(ofl:ofu,cndx)
                      diags_out(ofl:ofu,cndx) = .true.
                   endwhere
                   converged(cndx) = all( spc_conv(ofl:ofu,cndx) )
                end do
                convergence = all( converged(:) )
                if( convergence ) then
                   exit iter_loop
                end if
                do m = ofl,ofu
                   if( .not. cls_conv(m) ) then
                      cls_conv(m) = all( spc_conv(m,:) )
                   end if
                end do
             else conv_chk
                !-----------------------------------------------------------------------      
                !   	... limit iterate
                !-----------------------------------------------------------------------      
                do m = 1,clscnt4
                   solution(ofl:ofu,m) = max( 0._r8,solution(ofl:ofu,m) )
                end do
                !-----------------------------------------------------------------------      
                !   	... transfer latest solution back to base array
                !-----------------------------------------------------------------------      
                do cndx = 1,clscnt4
                   pndx = permute(cndx,4)
                   bndx = clsmap(cndx,4)
                   base_sol(ofl:ofu,bndx) = solution(ofl:ofu,pndx)
                end do
             end if conv_chk
          end do iter_loop

          !-----------------------------------------------------------------------      
          !    	... check for newton-raphson convergence
          !-----------------------------------------------------------------------      
          non_conv :  if( .not. convergence ) then
             !-----------------------------------------------------------------------      
             !   	... non-convergence
             !-----------------------------------------------------------------------      
             fail_cnt = fail_cnt + 1
             nstep    = get_nstep()
             write(iulog,'('' imp_sol: time step '',1p,g15.7,'' failed to converge @ (lchnk,ofl,ofu,nstep) = '',4i6)') &
                  dt,lchnk,ofl,ofu,nstep
             stp_con_cnt = 0
             step_reduction : if( cut_cnt < cut_limit ) then
                cut_cnt = cut_cnt + 1
                if( cut_cnt < cut_limit ) then
                   dt = .5_r8 * dt
                else
                   dt = .1_r8 * dt
                end if
                do m = 1,gas_pcnst
                   base_sol(ofl:ofu,m) = sbase_sol(ofl:ofu,m)
                end do
                cycle time_step_loop
             else step_reduction
                write(iulog,'('' imp_sol: step failed to converge @ (lchnk,ofl,ofu,nstep,dt,time) = '',4i6,1p,2g15.7)') &
                     lchnk,ofl,ofu,nstep,dt,interval_done+dt
                do m = 1,clscnt4
                   if( .not. converged(m) ) then
                      write(iulog,'(1x,a8,1x,1pe10.3)') solsym(clsmap(m,4)), max_delta(m)
                   end if
                end do
             end if step_reduction
          end if non_conv
          !-----------------------------------------------------------------------      
          !   	... check for interval done
          !-----------------------------------------------------------------------      
          interval_done = interval_done + dt
          time_step_done : if( abs( delt - interval_done ) <= .0001_r8 ) then
             if( fail_cnt > 0 ) then
                write(iulog,'(''imp_sol : @ (lchnk,ofl,ofu) = '',3i6,'' failed '',i2,'' times'')') &
                     lchnk,ofl,ofu,fail_cnt
             end if
             exit time_step_loop
          else time_step_done
             !-----------------------------------------------------------------------      
             !   	... transfer latest solution back to base array
             !-----------------------------------------------------------------------      
             if( convergence ) then
                stp_con_cnt = stp_con_cnt + 1
             end if
             do m = 1,gas_pcnst
                sbase_sol(ofl:ofu,m) = base_sol(ofl:ofu,m)
             end do
             if( stp_con_cnt >= 2 ) then
                dt = 2._r8*dt
                stp_con_cnt = 0
             end if
             dt = min( dt,delt-interval_done )
          end if time_step_done
       end do time_step_loop

       ofl = ofu + 1
       if( ofl > chnkpnts ) then
          exit chnkpnts_loop
       end if
    end do chnkpnts_loop

  end subroutine imp_sol

end module mo_imp_sol
