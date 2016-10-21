      module mo_setrxt
      use shr_kind_mod, only : r8 => shr_kind_r8
      private
      public :: setrxt
      public :: setrxt_hrates
      contains
      subroutine setrxt( rate, temp, m, ncol )
      use ppgrid, only : pver, pcols
      use shr_kind_mod, only : r8 => shr_kind_r8
      use chem_mods, only : rxntot
      use mo_jpl, only : jpl
      implicit none
!-------------------------------------------------------
! ... dummy arguments
!-------------------------------------------------------
      integer, intent(in) :: ncol
      real(r8), intent(in) :: temp(pcols,pver)
      real(r8), intent(in) :: m(ncol,pver)
      real(r8), intent(inout) :: rate(ncol,pver,rxntot)
!-------------------------------------------------------
! ... local variables
!-------------------------------------------------------
      integer :: n
      real(r8) :: itemp(ncol,pver)
      real(r8) :: exp_fac(ncol,pver)
      real(r8) :: ko(ncol,pver)
      real(r8) :: kinf(ncol,pver)
      rate(:,:,153) = 0.000258_r8
      rate(:,:,154) = 0.085_r8
      rate(:,:,155) = 1.31e-10_r8
      rate(:,:,156) = 3.5e-11_r8
      rate(:,:,157) = 9e-12_r8
      rate(:,:,158) = 1.2e-10_r8
      rate(:,:,163) = 1.2e-10_r8
      rate(:,:,164) = 1e-20_r8
      rate(:,:,165) = 1.3e-16_r8
      rate(:,:,167) = 4.2e-13_r8
      rate(:,:,169) = 8e-14_r8
      rate(:,:,170) = 3.9e-17_r8
      rate(:,:,177) = 6.9e-12_r8
      rate(:,:,178) = 7.2e-11_r8
      rate(:,:,179) = 1.6e-12_r8
      rate(:,:,185) = 1.8e-12_r8
      rate(:,:,189) = 1.8e-12_r8
      rate(:,:,193) = 7e-13_r8
      rate(:,:,194) = 5e-12_r8
      rate(:,:,203) = 3.5e-12_r8
      rate(:,:,205) = 1e-11_r8
      rate(:,:,206) = 2.2e-11_r8
      rate(:,:,207) = 5e-11_r8
      rate(:,:,242) = 1.7e-13_r8
      rate(:,:,244) = 2.607e-10_r8
      rate(:,:,245) = 9.75e-11_r8
      rate(:,:,246) = 2.07e-10_r8
      rate(:,:,247) = 2.088e-10_r8
      rate(:,:,248) = 1.17e-10_r8
      rate(:,:,249) = 4.644e-11_r8
      rate(:,:,250) = 1.204e-10_r8
      rate(:,:,251) = 9.9e-11_r8
      rate(:,:,252) = 3.3e-12_r8
      rate(:,:,271) = 4.5e-11_r8
      rate(:,:,272) = 4.62e-10_r8
      rate(:,:,273) = 9.9e-11_r8
      rate(:,:,274) = 1.2e-10_r8
      rate(:,:,275) = 9e-11_r8
      rate(:,:,276) = 3e-11_r8
      rate(:,:,281) = 2.14e-11_r8
      rate(:,:,282) = 1.9e-10_r8
      rate(:,:,295) = 2.57e-10_r8
      rate(:,:,296) = 1.8e-10_r8
      rate(:,:,297) = 1.794e-10_r8
      rate(:,:,298) = 1.3e-10_r8
      rate(:,:,299) = 7.65e-11_r8
      rate(:,:,313) = 4e-13_r8
      rate(:,:,323) = 6.8e-14_r8
      rate(:,:,324) = 2e-13_r8
      rate(:,:,338) = 7e-13_r8
      rate(:,:,339) = 1e-12_r8
      rate(:,:,343) = 1e-14_r8
      rate(:,:,344) = 1e-11_r8
      rate(:,:,345) = 1.15e-11_r8
      rate(:,:,346) = 4e-14_r8
      rate(:,:,359) = 3e-12_r8
      rate(:,:,360) = 6.7e-13_r8
      rate(:,:,370) = 3.5e-13_r8
      rate(:,:,371) = 5.4e-11_r8
      rate(:,:,374) = 2e-12_r8
      rate(:,:,375) = 1.4e-11_r8
      rate(:,:,378) = 2.4e-12_r8
      rate(:,:,389) = 5e-12_r8
      rate(:,:,399) = 1.6e-12_r8
      rate(:,:,401) = 6.7e-12_r8
      rate(:,:,404) = 3.5e-12_r8
      rate(:,:,407) = 1.3e-11_r8
      rate(:,:,408) = 1.4e-11_r8
      rate(:,:,412) = 2.4e-12_r8
      rate(:,:,413) = 1.4e-11_r8
      rate(:,:,418) = 2.4e-12_r8
      rate(:,:,419) = 4e-11_r8
      rate(:,:,420) = 4e-11_r8
      rate(:,:,422) = 1.4e-11_r8
      rate(:,:,426) = 2.4e-12_r8
      rate(:,:,427) = 4e-11_r8
      rate(:,:,431) = 7e-11_r8
      rate(:,:,432) = 1e-10_r8
      rate(:,:,438) = 2.4e-12_r8
      rate(:,:,453) = 4.7e-11_r8
      rate(:,:,466) = 2.1e-12_r8
      rate(:,:,467) = 2.8e-13_r8
      rate(:,:,475) = 1.7e-11_r8
      rate(:,:,481) = 8.4e-11_r8
      rate(:,:,483) = 1.9e-11_r8
      rate(:,:,484) = 1.2e-14_r8
      rate(:,:,485) = 2e-10_r8
      rate(:,:,487) = 6.3e-16_r8
      rate(:,:,492) = 2.4e-12_r8
      rate(:,:,493) = 2e-11_r8
      rate(:,:,497) = 2.3e-11_r8
      rate(:,:,498) = 2e-11_r8
      rate(:,:,503) = 1e-12_r8
      rate(:,:,504) = 5.7e-11_r8
      rate(:,:,505) = 3.4e-11_r8
      rate(:,:,508) = 2.3e-12_r8
      rate(:,:,509) = 1.2e-11_r8
      rate(:,:,510) = 5.7e-11_r8
      rate(:,:,511) = 2.8e-11_r8
      rate(:,:,512) = 6.6e-11_r8
      rate(:,:,513) = 1.4e-11_r8
      rate(:,:,516) = 1.9e-12_r8
      rate(:,:,527) = 6.34e-08_r8
      rate(:,:,528) = 6.34e-08_r8
      rate(:,:,531) = 1.34e-11_r8
      rate(:,:,532) = 1.34e-11_r8
      rate(:,:,553) = 6e-11_r8
      rate(:,:,556) = 1e-12_r8
      rate(:,:,557) = 4e-10_r8
      rate(:,:,558) = 2e-10_r8
      rate(:,:,559) = 1e-10_r8
      rate(:,:,560) = 5e-16_r8
      rate(:,:,561) = 4.4e-10_r8
      rate(:,:,562) = 9e-10_r8
      rate(:,:,565) = 1.2e-14_r8
      rate(:,:,576) = 1.2e-10_r8
      rate(:,:,579) = 2.8e-13_r8
      itemp(:ncol,:) = 1._r8 / temp(:ncol,:)
      n = ncol*pver
      rate(:,:,159) = 1.63e-10_r8 * exp( 60._r8 * itemp(:,:) )
      rate(:,:,160) = 2.15e-11_r8 * exp( 110._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 55._r8 * itemp(:,:) )
      rate(:,:,161) = 2.64e-11_r8 * exp_fac(:,:)
      rate(:,:,162) = 6.6e-12_r8 * exp_fac(:,:)
      rate(:,:,166) = 3.6e-18_r8 * exp( -220._r8 * itemp(:,:) )
      rate(:,:,168) = 1.8e-15_r8 * exp( 45._r8 * itemp(:,:) )
      rate(:,:,171) = 3.5e-11_r8 * exp( -135._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -2060._r8 * itemp(:,:) )
      rate(:,:,172) = 8e-12_r8 * exp_fac(:,:)
      rate(:,:,578) = 8e-12_r8 * exp_fac(:,:)
      rate(:,:,175) = 1.6e-11_r8 * exp( -4570._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -2000._r8 * itemp(:,:) )
      rate(:,:,176) = 1.4e-12_r8 * exp_fac(:,:)
      rate(:,:,428) = 1.05e-14_r8 * exp_fac(:,:)
      rate(:,:,570) = 1.05e-14_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( 200._r8 * itemp(:,:) )
      rate(:,:,181) = 3e-11_r8 * exp_fac(:,:)
      rate(:,:,269) = 5.5e-12_r8 * exp_fac(:,:)
      rate(:,:,309) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,328) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,355) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,363) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,367) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,383) = 2.3e-11_r8 * exp_fac(:,:)
      rate(:,:,393) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,403) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,430) = 1.52e-11_r8 * exp_fac(:,:)
      rate(:,:,445) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,448) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,452) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,468) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,472) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,478) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,482) = 3.8e-12_r8 * exp_fac(:,:)
      rate(:,:,502) = 3.3e-11_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( -490._r8 * itemp(:,:) )
      rate(:,:,182) = 1e-14_r8 * exp_fac(:,:)
      rate(:,:,568) = 1e-14_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( -470._r8 * itemp(:,:) )
      rate(:,:,183) = 1.4e-10_r8 * exp_fac(:,:)
      rate(:,:,569) = 1.4e-10_r8 * exp_fac(:,:)
      rate(:,:,184) = 2.8e-12_r8 * exp( -1800._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 250._r8 * itemp(:,:) )
      rate(:,:,186) = 4.8e-11_r8 * exp_fac(:,:)
      rate(:,:,267) = 1.7e-11_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( 180._r8 * itemp(:,:) )
      rate(:,:,187) = 1.8e-11_r8 * exp_fac(:,:)
      rate(:,:,341) = 4.2e-12_r8 * exp_fac(:,:)
      rate(:,:,354) = 4.2e-12_r8 * exp_fac(:,:)
      rate(:,:,362) = 4.2e-12_r8 * exp_fac(:,:)
      rate(:,:,391) = 4.2e-12_r8 * exp_fac(:,:)
      rate(:,:,411) = 4.4e-12_r8 * exp_fac(:,:)
      rate(:,:,417) = 4.4e-12_r8 * exp_fac(:,:)
      rate(:,:,491) = 4.2e-12_r8 * exp_fac(:,:)
      rate(:,:,496) = 4.2e-12_r8 * exp_fac(:,:)
      rate(:,:,501) = 4.2e-12_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( -940._r8 * itemp(:,:) )
      rate(:,:,188) = 1.7e-12_r8 * exp_fac(:,:)
      rate(:,:,577) = 1.7e-12_r8 * exp_fac(:,:)
      rate(:,:,192) = 1.3e-12_r8 * exp( 380._r8 * itemp(:,:) )
      rate(:,:,195) = 2.1e-11_r8 * exp( 100._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 220._r8 * itemp(:,:) )
      rate(:,:,196) = 2.9e-12_r8 * exp_fac(:,:)
      rate(:,:,197) = 1.45e-12_r8 * exp_fac(:,:)
      rate(:,:,198) = 1.45e-12_r8 * exp_fac(:,:)
      rate(:,:,199) = 1.5e-11_r8 * exp( -3600._r8 * itemp(:,:) )
      rate(:,:,200) = 5.1e-12_r8 * exp( 210._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -2450._r8 * itemp(:,:) )
      rate(:,:,201) = 1.2e-13_r8 * exp_fac(:,:)
      rate(:,:,227) = 3e-11_r8 * exp_fac(:,:)
      rate(:,:,574) = 1.2e-13_r8 * exp_fac(:,:)
      rate(:,:,204) = 1.5e-11_r8 * exp( 170._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 270._r8 * itemp(:,:) )
      rate(:,:,208) = 3.3e-12_r8 * exp_fac(:,:)
      rate(:,:,223) = 1.4e-11_r8 * exp_fac(:,:)
      rate(:,:,237) = 7.4e-12_r8 * exp_fac(:,:)
      rate(:,:,337) = 8.1e-12_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( -1500._r8 * itemp(:,:) )
      rate(:,:,209) = 3e-12_r8 * exp_fac(:,:)
      rate(:,:,268) = 5.8e-12_r8 * exp_fac(:,:)
      rate(:,:,575) = 3e-12_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( 20._r8 * itemp(:,:) )
      rate(:,:,211) = 7.26e-11_r8 * exp_fac(:,:)
      rate(:,:,212) = 4.64e-11_r8 * exp_fac(:,:)
      rate(:,:,219) = 8.1e-11_r8 * exp( -30._r8 * itemp(:,:) )
      rate(:,:,220) = 7.1e-12_r8 * exp( -1270._r8 * itemp(:,:) )
      rate(:,:,221) = 3.05e-11_r8 * exp( -2270._r8 * itemp(:,:) )
      rate(:,:,222) = 1.1e-11_r8 * exp( -980._r8 * itemp(:,:) )
      rate(:,:,224) = 3.6e-11_r8 * exp( -375._r8 * itemp(:,:) )
      rate(:,:,225) = 2.3e-11_r8 * exp( -200._r8 * itemp(:,:) )
      rate(:,:,226) = 3.3e-12_r8 * exp( -115._r8 * itemp(:,:) )
      rate(:,:,228) = 1e-12_r8 * exp( -1590._r8 * itemp(:,:) )
      rate(:,:,229) = 3.5e-13_r8 * exp( -1370._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 290._r8 * itemp(:,:) )
      rate(:,:,230) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,231) = 6.4e-12_r8 * exp_fac(:,:)
      rate(:,:,261) = 4.1e-13_r8 * exp_fac(:,:)
      rate(:,:,441) = 7.5e-12_r8 * exp_fac(:,:)
      rate(:,:,455) = 7.5e-12_r8 * exp_fac(:,:)
      rate(:,:,458) = 7.5e-12_r8 * exp_fac(:,:)
      rate(:,:,461) = 7.5e-12_r8 * exp_fac(:,:)
      rate(:,:,232) = 6.5e-12_r8 * exp( 135._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -840._r8 * itemp(:,:) )
      rate(:,:,234) = 3.6e-12_r8 * exp_fac(:,:)
      rate(:,:,284) = 2e-12_r8 * exp_fac(:,:)
      rate(:,:,235) = 1.2e-12_r8 * exp( -330._r8 * itemp(:,:) )
      rate(:,:,236) = 2.8e-11_r8 * exp( 85._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 230._r8 * itemp(:,:) )
      rate(:,:,238) = 6e-13_r8 * exp_fac(:,:)
      rate(:,:,258) = 1.5e-12_r8 * exp_fac(:,:)
      rate(:,:,266) = 1.9e-11_r8 * exp_fac(:,:)
      rate(:,:,239) = 1e-11_r8 * exp( -3300._r8 * itemp(:,:) )
      rate(:,:,240) = 1.8e-12_r8 * exp( -250._r8 * itemp(:,:) )
      rate(:,:,241) = 3.4e-12_r8 * exp( -130._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -500._r8 * itemp(:,:) )
      rate(:,:,243) = 3e-12_r8 * exp_fac(:,:)
      rate(:,:,278) = 1.4e-10_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( -800._r8 * itemp(:,:) )
      rate(:,:,255) = 1.7e-11_r8 * exp_fac(:,:)
      rate(:,:,283) = 6.3e-12_r8 * exp_fac(:,:)
      rate(:,:,256) = 4.8e-12_r8 * exp( -310._r8 * itemp(:,:) )
      rate(:,:,257) = 1.6e-11_r8 * exp( -780._r8 * itemp(:,:) )
      rate(:,:,259) = 9.5e-13_r8 * exp( 550._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 260._r8 * itemp(:,:) )
      rate(:,:,260) = 2.3e-12_r8 * exp_fac(:,:)
      rate(:,:,263) = 8.8e-12_r8 * exp_fac(:,:)
      rate(:,:,262) = 4.5e-12_r8 * exp( 460._r8 * itemp(:,:) )
      rate(:,:,265) = 1.9e-11_r8 * exp( 215._r8 * itemp(:,:) )
      rate(:,:,270) = 1.2e-10_r8 * exp( -430._r8 * itemp(:,:) )
      rate(:,:,277) = 1.6e-10_r8 * exp( -260._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 0._r8 * itemp(:,:) )
      rate(:,:,279) = 1.4e-11_r8 * exp_fac(:,:)
      rate(:,:,281) = 2.14e-11_r8 * exp_fac(:,:)
      rate(:,:,282) = 1.9e-10_r8 * exp_fac(:,:)
      rate(:,:,295) = 2.57e-10_r8 * exp_fac(:,:)
      rate(:,:,296) = 1.8e-10_r8 * exp_fac(:,:)
      rate(:,:,297) = 1.794e-10_r8 * exp_fac(:,:)
      rate(:,:,298) = 1.3e-10_r8 * exp_fac(:,:)
      rate(:,:,299) = 7.65e-11_r8 * exp_fac(:,:)
      rate(:,:,313) = 4e-13_r8 * exp_fac(:,:)
      rate(:,:,323) = 6.8e-14_r8 * exp_fac(:,:)
      rate(:,:,324) = 2e-13_r8 * exp_fac(:,:)
      rate(:,:,338) = 7e-13_r8 * exp_fac(:,:)
      rate(:,:,339) = 1e-12_r8 * exp_fac(:,:)
      rate(:,:,343) = 1e-14_r8 * exp_fac(:,:)
      rate(:,:,344) = 1e-11_r8 * exp_fac(:,:)
      rate(:,:,345) = 1.15e-11_r8 * exp_fac(:,:)
      rate(:,:,346) = 4e-14_r8 * exp_fac(:,:)
      rate(:,:,359) = 3e-12_r8 * exp_fac(:,:)
      rate(:,:,360) = 6.7e-13_r8 * exp_fac(:,:)
      rate(:,:,370) = 3.5e-13_r8 * exp_fac(:,:)
      rate(:,:,371) = 5.4e-11_r8 * exp_fac(:,:)
      rate(:,:,374) = 2e-12_r8 * exp_fac(:,:)
      rate(:,:,375) = 1.4e-11_r8 * exp_fac(:,:)
      rate(:,:,378) = 2.4e-12_r8 * exp_fac(:,:)
      rate(:,:,389) = 5e-12_r8 * exp_fac(:,:)
      rate(:,:,399) = 1.6e-12_r8 * exp_fac(:,:)
      rate(:,:,401) = 6.7e-12_r8 * exp_fac(:,:)
      rate(:,:,404) = 3.5e-12_r8 * exp_fac(:,:)
      rate(:,:,407) = 1.3e-11_r8 * exp_fac(:,:)
      rate(:,:,408) = 1.4e-11_r8 * exp_fac(:,:)
      rate(:,:,412) = 2.4e-12_r8 * exp_fac(:,:)
      rate(:,:,413) = 1.4e-11_r8 * exp_fac(:,:)
      rate(:,:,418) = 2.4e-12_r8 * exp_fac(:,:)
      rate(:,:,419) = 4e-11_r8 * exp_fac(:,:)
      rate(:,:,420) = 4e-11_r8 * exp_fac(:,:)
      rate(:,:,422) = 1.4e-11_r8 * exp_fac(:,:)
      rate(:,:,426) = 2.4e-12_r8 * exp_fac(:,:)
      rate(:,:,427) = 4e-11_r8 * exp_fac(:,:)
      rate(:,:,431) = 7e-11_r8 * exp_fac(:,:)
      rate(:,:,432) = 1e-10_r8 * exp_fac(:,:)
      rate(:,:,438) = 2.4e-12_r8 * exp_fac(:,:)
      rate(:,:,453) = 4.7e-11_r8 * exp_fac(:,:)
      rate(:,:,466) = 2.1e-12_r8 * exp_fac(:,:)
      rate(:,:,467) = 2.8e-13_r8 * exp_fac(:,:)
      rate(:,:,475) = 1.7e-11_r8 * exp_fac(:,:)
      rate(:,:,481) = 8.4e-11_r8 * exp_fac(:,:)
      rate(:,:,483) = 1.9e-11_r8 * exp_fac(:,:)
      rate(:,:,484) = 1.2e-14_r8 * exp_fac(:,:)
      rate(:,:,485) = 2e-10_r8 * exp_fac(:,:)
      rate(:,:,487) = 6.3e-16_r8 * exp_fac(:,:)
      rate(:,:,492) = 2.4e-12_r8 * exp_fac(:,:)
      rate(:,:,493) = 2e-11_r8 * exp_fac(:,:)
      rate(:,:,497) = 2.3e-11_r8 * exp_fac(:,:)
      rate(:,:,498) = 2e-11_r8 * exp_fac(:,:)
      rate(:,:,503) = 1e-12_r8 * exp_fac(:,:)
      rate(:,:,504) = 5.7e-11_r8 * exp_fac(:,:)
      rate(:,:,505) = 3.4e-11_r8 * exp_fac(:,:)
      rate(:,:,508) = 2.3e-12_r8 * exp_fac(:,:)
      rate(:,:,509) = 1.2e-11_r8 * exp_fac(:,:)
      rate(:,:,510) = 5.7e-11_r8 * exp_fac(:,:)
      rate(:,:,511) = 2.8e-11_r8 * exp_fac(:,:)
      rate(:,:,512) = 6.6e-11_r8 * exp_fac(:,:)
      rate(:,:,513) = 1.4e-11_r8 * exp_fac(:,:)
      rate(:,:,516) = 1.9e-12_r8 * exp_fac(:,:)
      rate(:,:,527) = 6.34e-08_r8 * exp_fac(:,:)
      rate(:,:,528) = 6.34e-08_r8 * exp_fac(:,:)
      rate(:,:,531) = 1.34e-11_r8 * exp_fac(:,:)
      rate(:,:,532) = 1.34e-11_r8 * exp_fac(:,:)
      rate(:,:,553) = 6e-11_r8 * exp_fac(:,:)
      rate(:,:,556) = 1e-12_r8 * exp_fac(:,:)
      rate(:,:,557) = 4e-10_r8 * exp_fac(:,:)
      rate(:,:,558) = 2e-10_r8 * exp_fac(:,:)
      rate(:,:,559) = 1e-10_r8 * exp_fac(:,:)
      rate(:,:,560) = 5e-16_r8 * exp_fac(:,:)
      rate(:,:,561) = 4.4e-10_r8 * exp_fac(:,:)
      rate(:,:,562) = 9e-10_r8 * exp_fac(:,:)
      rate(:,:,565) = 1.2e-14_r8 * exp_fac(:,:)
      rate(:,:,576) = 1.2e-10_r8 * exp_fac(:,:)
      rate(:,:,579) = 2.8e-13_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( 400._r8 * itemp(:,:) )
      rate(:,:,280) = 6e-12_r8 * exp_fac(:,:)
      rate(:,:,376) = 5e-13_r8 * exp_fac(:,:)
      rate(:,:,409) = 5e-13_r8 * exp_fac(:,:)
      rate(:,:,414) = 5e-13_r8 * exp_fac(:,:)
      rate(:,:,423) = 5e-13_r8 * exp_fac(:,:)
      rate(:,:,435) = 5e-13_r8 * exp_fac(:,:)
      rate(:,:,285) = 1.46e-11_r8 * exp( -1040._r8 * itemp(:,:) )
      rate(:,:,286) = 1.42e-12_r8 * exp( -1150._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -1520._r8 * itemp(:,:) )
      rate(:,:,287) = 1.64e-12_r8 * exp_fac(:,:)
      rate(:,:,395) = 8.5e-16_r8 * exp_fac(:,:)
      rate(:,:,573) = 8.5e-16_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( -1100._r8 * itemp(:,:) )
      rate(:,:,288) = 2.03e-11_r8 * exp_fac(:,:)
      rate(:,:,515) = 3.4e-12_r8 * exp_fac(:,:)
      rate(:,:,289) = 1.96e-12_r8 * exp( -1200._r8 * itemp(:,:) )
      rate(:,:,290) = 4.85e-12_r8 * exp( -850._r8 * itemp(:,:) )
      rate(:,:,291) = 9e-13_r8 * exp( -360._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -1600._r8 * itemp(:,:) )
      rate(:,:,292) = 1.25e-12_r8 * exp_fac(:,:)
      rate(:,:,302) = 3.4e-11_r8 * exp_fac(:,:)
      rate(:,:,293) = 1.3e-12_r8 * exp( -1770._r8 * itemp(:,:) )
      rate(:,:,294) = 9.2e-13_r8 * exp( -1560._r8 * itemp(:,:) )
      rate(:,:,300) = 9.7e-15_r8 * exp( 625._r8 * itemp(:,:) )
      rate(:,:,301) = 6e-13_r8 * exp( -2058._r8 * itemp(:,:) )
      rate(:,:,303) = 5.5e-12_r8 * exp( 125._r8 * itemp(:,:) )
      rate(:,:,304) = 5e-13_r8 * exp( -424._r8 * itemp(:,:) )
      rate(:,:,305) = 1.9e-14_r8 * exp( 706._r8 * itemp(:,:) )
      rate(:,:,306) = 4.1e-13_r8 * exp( 750._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 300._r8 * itemp(:,:) )
      rate(:,:,307) = 2.8e-12_r8 * exp_fac(:,:)
      rate(:,:,366) = 2.9e-12_r8 * exp_fac(:,:)
      rate(:,:,308) = 2.9e-12_r8 * exp( -345._r8 * itemp(:,:) )
      rate(:,:,310) = 2.45e-12_r8 * exp( -1775._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 700._r8 * itemp(:,:) )
      rate(:,:,314) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,325) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,340) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,353) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,361) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,365) = 8.6e-13_r8 * exp_fac(:,:)
      rate(:,:,377) = 8e-13_r8 * exp_fac(:,:)
      rate(:,:,390) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,400) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,410) = 8e-13_r8 * exp_fac(:,:)
      rate(:,:,415) = 8e-13_r8 * exp_fac(:,:)
      rate(:,:,424) = 8e-13_r8 * exp_fac(:,:)
      rate(:,:,436) = 8e-13_r8 * exp_fac(:,:)
      rate(:,:,443) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,447) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,450) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,463) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,470) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,476) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,479) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,490) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,495) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,500) = 7.5e-13_r8 * exp_fac(:,:)
      rate(:,:,315) = 2.4e+12_r8 * exp( -7000._r8 * itemp(:,:) )
      rate(:,:,316) = 2.6e-12_r8 * exp( 265._r8 * itemp(:,:) )
      rate(:,:,317) = 1.08e-10_r8 * exp( 105._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -2630._r8 * itemp(:,:) )
      rate(:,:,322) = 1.2e-14_r8 * exp_fac(:,:)
      rate(:,:,566) = 1.2e-14_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( 365._r8 * itemp(:,:) )
      rate(:,:,326) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,444) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,449) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,451) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,464) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,471) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,477) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,480) = 2.6e-12_r8 * exp_fac(:,:)
      rate(:,:,327) = 6.9e-12_r8 * exp( -230._r8 * itemp(:,:) )
      rate(:,:,329) = 7.2e-11_r8 * exp( -70._r8 * itemp(:,:) )
      rate(:,:,330) = 7.66e-12_r8 * exp( -1020._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( -1900._r8 * itemp(:,:) )
      rate(:,:,331) = 1.4e-12_r8 * exp_fac(:,:)
      rate(:,:,351) = 6.5e-15_r8 * exp_fac(:,:)
      rate(:,:,567) = 6.5e-15_r8 * exp_fac(:,:)
      rate(:,:,332) = 4.63e-12_r8 * exp( 350._r8 * itemp(:,:) )
      rate(:,:,333) = 7.8e-13_r8 * exp( -1050._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 500._r8 * itemp(:,:) )
      rate(:,:,334) = 2.9e-12_r8 * exp_fac(:,:)
      rate(:,:,335) = 2e-12_r8 * exp_fac(:,:)
      rate(:,:,364) = 7.1e-13_r8 * exp_fac(:,:)
      rate(:,:,385) = 2e-12_r8 * exp_fac(:,:)
      rate(:,:,489) = 2e-12_r8 * exp_fac(:,:)
      rate(:,:,494) = 2e-12_r8 * exp_fac(:,:)
      rate(:,:,499) = 2e-12_r8 * exp_fac(:,:)
      exp_fac(:,:) = exp( 1040._r8 * itemp(:,:) )
      rate(:,:,336) = 4.3e-13_r8 * exp_fac(:,:)
      rate(:,:,386) = 4.3e-13_r8 * exp_fac(:,:)
      rate(:,:,440) = 4.3e-13_r8 * exp_fac(:,:)
      rate(:,:,454) = 4.3e-13_r8 * exp_fac(:,:)
      rate(:,:,457) = 4.3e-13_r8 * exp_fac(:,:)
      rate(:,:,460) = 4.3e-13_r8 * exp_fac(:,:)
      rate(:,:,342) = 1.6e+11_r8 * exp( -4150._r8 * itemp(:,:) )
      rate(:,:,350) = 4.6e-13_r8 * exp( -1156._r8 * itemp(:,:) )
      rate(:,:,352) = 3.75e-13_r8 * exp( -40._r8 * itemp(:,:) )
      rate(:,:,356) = 8.7e-12_r8 * exp( -615._r8 * itemp(:,:) )
      rate(:,:,357) = 1.4e-12_r8 * exp( -1860._r8 * itemp(:,:) )
      rate(:,:,358) = 8.4e-13_r8 * exp( 830._r8 * itemp(:,:) )
      rate(:,:,372) = 4.8e-12_r8 * exp( 120._r8 * itemp(:,:) )
      rate(:,:,373) = 5.1e-14_r8 * exp( 693._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 360._r8 * itemp(:,:) )
      rate(:,:,379) = 2.7e-12_r8 * exp_fac(:,:)
      rate(:,:,380) = 1.3e-13_r8 * exp_fac(:,:)
      rate(:,:,382) = 9.6e-12_r8 * exp_fac(:,:)
      rate(:,:,388) = 5.3e-12_r8 * exp_fac(:,:)
      rate(:,:,425) = 2.7e-12_r8 * exp_fac(:,:)
      rate(:,:,437) = 2.7e-12_r8 * exp_fac(:,:)
      rate(:,:,381) = 1.5e-15_r8 * exp( -2100._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 530._r8 * itemp(:,:) )
      rate(:,:,384) = 4.6e-12_r8 * exp_fac(:,:)
      rate(:,:,387) = 2.3e-12_r8 * exp_fac(:,:)
      rate(:,:,392) = 2.3e-12_r8 * exp( -170._r8 * itemp(:,:) )
      rate(:,:,396) = 4.13e-12_r8 * exp( 452._r8 * itemp(:,:) )
      rate(:,:,402) = 5.4e-14_r8 * exp( 870._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 175._r8 * itemp(:,:) )
      rate(:,:,405) = 1.86e-11_r8 * exp_fac(:,:)
      rate(:,:,406) = 1.86e-11_r8 * exp_fac(:,:)
      rate(:,:,416) = 1.6e+09_r8 * exp( -8300._r8 * itemp(:,:) )
      rate(:,:,421) = 3.03e-12_r8 * exp( -446._r8 * itemp(:,:) )
      rate(:,:,429) = 2.54e-11_r8 * exp( 410._r8 * itemp(:,:) )
      rate(:,:,434) = 1.3e-12_r8 * exp( 640._r8 * itemp(:,:) )
      rate(:,:,439) = 1.9e-12_r8 * exp( 190._r8 * itemp(:,:) )
      rate(:,:,442) = 2.3e-12_r8 * exp( -193._r8 * itemp(:,:) )
      rate(:,:,446) = 5.9e-12_r8 * exp( 225._r8 * itemp(:,:) )
      rate(:,:,465) = 4.7e-13_r8 * exp( 1220._r8 * itemp(:,:) )
      rate(:,:,473) = 1.7e-12_r8 * exp( 352._r8 * itemp(:,:) )
      rate(:,:,486) = 1.2e-12_r8 * exp( 490._r8 * itemp(:,:) )
      rate(:,:,488) = 1.2e-11_r8 * exp( 440._r8 * itemp(:,:) )
      rate(:,:,506) = 2.1e-11_r8 * exp( -2200._r8 * itemp(:,:) )
      rate(:,:,507) = 7.2e-14_r8 * exp( -1070._r8 * itemp(:,:) )
      rate(:,:,514) = 1.6e-13_r8 * exp( -2280._r8 * itemp(:,:) )
      rate(:,:,517) = 2.7e-11_r8 * exp( 335._r8 * itemp(:,:) )
      rate(:,:,520) = 1.9e-13_r8 * exp( 520._r8 * itemp(:,:) )
      rate(:,:,521) = 9.6e-12_r8 * exp( -234._r8 * itemp(:,:) )
      rate(:,:,522) = 1.7e-12_r8 * exp( -710._r8 * itemp(:,:) )
      rate(:,:,571) = 4.4e-15_r8 * exp( -2500._r8 * itemp(:,:) )
      rate(:,:,572) = 6.3e-16_r8 * exp( -580._r8 * itemp(:,:) )
      itemp(:,:) = 300._r8 * itemp(:,:)
      ko(:,:) = 4.4e-32_r8 * itemp(:,:)**1.3_r8
      kinf(:,:) = 7.5e-11_r8 * itemp(:,:)**(-0.2_r8)
      call jpl( rate(1,1,180), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 6.9e-31_r8 * itemp(:,:)**1._r8
      kinf(:,:) = 2.6e-11_r8
      call jpl( rate(1,1,190), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 2.5e-31_r8 * itemp(:,:)**1.8_r8
      kinf(:,:) = 2.2e-11_r8 * itemp(:,:)**0.7_r8
      call jpl( rate(1,1,202), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 9e-32_r8 * itemp(:,:)**1.5_r8
      kinf(:,:) = 3e-11_r8
      call jpl( rate(1,1,210), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 1.9e-31_r8 * itemp(:,:)**3.4_r8
      kinf(:,:) = 4e-12_r8 * itemp(:,:)**0.3_r8
      call jpl( rate(1,1,213), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 2.4e-30_r8 * itemp(:,:)**3._r8
      kinf(:,:) = 1.6e-12_r8 * itemp(:,:)**(-0.1_r8)
      call jpl( rate(1,1,214), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 1.8e-30_r8 * itemp(:,:)**3._r8
      kinf(:,:) = 2.8e-11_r8
      call jpl( rate(1,1,215), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 1.8e-31_r8 * itemp(:,:)**3.4_r8
      kinf(:,:) = 1.5e-11_r8 * itemp(:,:)**1.9_r8
      call jpl( rate(1,1,233), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 1.9e-32_r8 * itemp(:,:)**3.6_r8
      kinf(:,:) = 3.7e-12_r8 * itemp(:,:)**1.6_r8
      call jpl( rate(1,1,253), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 5.2e-31_r8 * itemp(:,:)**3.2_r8
      kinf(:,:) = 6.9e-12_r8 * itemp(:,:)**2.9_r8
      call jpl( rate(1,1,264), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 5.9e-33_r8 * itemp(:,:)**1.4_r8
      kinf(:,:) = 1.1e-12_r8 * itemp(:,:)**(-1.3_r8)
      call jpl( rate(1,1,311), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 4.28e-33_r8
      kinf(:,:) = 9.3e-15_r8 * itemp(:,:)**(-4.42_r8)
      call jpl( rate(1,1,312), m, 0.8_r8, ko, kinf, n )
      ko(:,:) = 5.2e-30_r8 * itemp(:,:)**2.4_r8
      kinf(:,:) = 2.2e-10_r8 * itemp(:,:)**0.7_r8
      call jpl( rate(1,1,319), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 5.5e-30_r8
      kinf(:,:) = 8.3e-13_r8 * itemp(:,:)**(-2._r8)
      call jpl( rate(1,1,320), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 1.6e-29_r8 * itemp(:,:)**3.3_r8
      kinf(:,:) = 3.1e-10_r8 * itemp(:,:)
      call jpl( rate(1,1,321), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 8.6e-29_r8 * itemp(:,:)**3.1_r8
      kinf(:,:) = 9e-12_r8 * itemp(:,:)**0.85_r8
      call jpl( rate(1,1,347), m, 0.48_r8, ko, kinf, n )
      ko(:,:) = 9.7e-29_r8 * itemp(:,:)**5.6_r8
      kinf(:,:) = 9.3e-12_r8 * itemp(:,:)**1.5_r8
      call jpl( rate(1,1,348), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 8e-27_r8 * itemp(:,:)**3.5_r8
      kinf(:,:) = 3e-11_r8
      call jpl( rate(1,1,368), m, 0.5_r8, ko, kinf, n )
      ko(:,:) = 8e-27_r8 * itemp(:,:)**3.5_r8
      kinf(:,:) = 3e-11_r8
      call jpl( rate(1,1,394), m, 0.5_r8, ko, kinf, n )
      ko(:,:) = 9.7e-29_r8 * itemp(:,:)**5.6_r8
      kinf(:,:) = 9.3e-12_r8 * itemp(:,:)**1.5_r8
      call jpl( rate(1,1,456), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 9.7e-29_r8 * itemp(:,:)**5.6_r8
      kinf(:,:) = 9.3e-12_r8 * itemp(:,:)**1.5_r8
      call jpl( rate(1,1,459), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 9.7e-29_r8 * itemp(:,:)**5.6_r8
      kinf(:,:) = 9.3e-12_r8 * itemp(:,:)**1.5_r8
      call jpl( rate(1,1,462), m, 0.6_r8, ko, kinf, n )
      ko(:,:) = 9.7e-29_r8 * itemp(:,:)**5.6_r8
      kinf(:,:) = 9.3e-12_r8 * itemp(:,:)**1.5_r8
      call jpl( rate(1,1,469), m, 0.6_r8, ko, kinf, n )
      end subroutine setrxt
      subroutine setrxt_hrates( rate, temp, m, ncol, kbot )
      use ppgrid, only : pver, pcols
      use shr_kind_mod, only : r8 => shr_kind_r8
      use chem_mods, only : rxntot
      use mo_jpl, only : jpl
      implicit none
!-------------------------------------------------------
! ... dummy arguments
!-------------------------------------------------------
      integer, intent(in) :: ncol
      integer, intent(in) :: kbot
      real(r8), intent(in) :: temp(pcols,pver)
      real(r8), intent(in) :: m(ncol,pver)
      real(r8), intent(inout) :: rate(ncol,pver,rxntot)
!-------------------------------------------------------
! ... local variables
!-------------------------------------------------------
      integer :: n
      real(r8) :: itemp(ncol,kbot)
      real(r8) :: exp_fac(ncol,kbot)
      real(r8) :: ko(ncol,kbot)
      real(r8) :: kinf(ncol,kbot)
      real(r8) :: wrk(ncol,kbot)
      rate(:,:kbot,164) = 1e-20_r8
      rate(:,:kbot,165) = 1.3e-16_r8
      rate(:,:kbot,169) = 8e-14_r8
      rate(:,:kbot,170) = 3.9e-17_r8
      rate(:,:kbot,177) = 6.9e-12_r8
      rate(:,:kbot,193) = 7e-13_r8
      rate(:,:kbot,194) = 5e-12_r8
      rate(:,:kbot,553) = 6e-11_r8
      rate(:,:kbot,556) = 1e-12_r8
      rate(:,:kbot,557) = 4e-10_r8
      rate(:,:kbot,558) = 2e-10_r8
      rate(:,:kbot,559) = 1e-10_r8
      rate(:,:kbot,561) = 4.4e-10_r8
      itemp(:ncol,:kbot) = 1._r8 / temp(:ncol,:kbot)
      n = ncol*kbot
      rate(:,:kbot,160) = 2.15e-11_r8 * exp( 110._r8 * itemp(:,:) )
      exp_fac(:,:) = exp( 55._r8 * itemp(:,:) )
      rate(:,:kbot,161) = 2.64e-11_r8 * exp_fac(:,:)
      rate(:,:kbot,162) = 6.6e-12_r8 * exp_fac(:,:)
      rate(:,:kbot,166) = 3.6e-18_r8 * exp( -220._r8 * itemp(:,:) )
      rate(:,:kbot,168) = 1.8e-15_r8 * exp( 45._r8 * itemp(:,:) )
      rate(:,:kbot,171) = 3.5e-11_r8 * exp( -135._r8 * itemp(:,:) )
      rate(:,:kbot,172) = 8e-12_r8 * exp( -2060._r8 * itemp(:,:) )
      rate(:,:kbot,181) = 3e-11_r8 * exp( 200._r8 * itemp(:,:) )
      rate(:,:kbot,182) = 1e-14_r8 * exp( -490._r8 * itemp(:,:) )
      rate(:,:kbot,183) = 1.4e-10_r8 * exp( -470._r8 * itemp(:,:) )
      rate(:,:kbot,186) = 4.8e-11_r8 * exp( 250._r8 * itemp(:,:) )
      rate(:,:kbot,187) = 1.8e-11_r8 * exp( 180._r8 * itemp(:,:) )
      rate(:,:kbot,188) = 1.7e-12_r8 * exp( -940._r8 * itemp(:,:) )
      rate(:,:kbot,195) = 2.1e-11_r8 * exp( 100._r8 * itemp(:,:) )
      rate(:,:kbot,199) = 1.5e-11_r8 * exp( -3600._r8 * itemp(:,:) )
      rate(:,:kbot,200) = 5.1e-12_r8 * exp( 210._r8 * itemp(:,:) )
      rate(:,:kbot,208) = 3.3e-12_r8 * exp( 270._r8 * itemp(:,:) )
      rate(:,:kbot,209) = 3e-12_r8 * exp( -1500._r8 * itemp(:,:) )
      itemp(:,:) = 300._r8 * itemp(:,:)
      ko(:,:) = 4.4e-32_r8 * itemp(:,:)**1.3_r8
      kinf(:,:) = 7.5e-11_r8 * itemp(:,:)**(-0.2_r8)
      call jpl( wrk, m, 0.6_r8, ko, kinf, n )
      rate(:,:kbot,180) = wrk(:,:)
      end subroutine setrxt_hrates
      end module mo_setrxt
      module mo_adjrxt
      private
      public :: adjrxt
      contains
      subroutine adjrxt( rate, inv, m, ncol, nlev )
      use shr_kind_mod, only : r8 => shr_kind_r8
      use chem_mods, only : nfs, rxntot
      implicit none
!--------------------------------------------------------------------
! ... dummy arguments
!--------------------------------------------------------------------
      integer, intent(in) :: ncol, nlev
      real(r8), intent(in) :: inv(ncol,nlev,nfs)
      real(r8), intent(in) :: m(ncol,nlev)
      real(r8), intent(inout) :: rate(ncol,nlev,rxntot)
      rate(:,:,160) = rate(:,:,160) * inv(:,:, 2)
      rate(:,:,164) = rate(:,:,164) * inv(:,:, 2)
      rate(:,:,168) = rate(:,:,168) * inv(:,:, 2)
      rate(:,:,173) = rate(:,:,173) * inv(:,:, 1)
      rate(:,:,174) = rate(:,:,174) * inv(:,:, 1)
      rate(:,:,180) = rate(:,:,180) * inv(:,:, 1)
      rate(:,:,190) = rate(:,:,190) * inv(:,:, 1)
      rate(:,:,202) = rate(:,:,202) * inv(:,:, 1)
      rate(:,:,210) = rate(:,:,210) * inv(:,:, 1)
      rate(:,:,213) = rate(:,:,213) * inv(:,:, 1)
      rate(:,:,214) = rate(:,:,214) * inv(:,:, 1)
      rate(:,:,215) = rate(:,:,215) * inv(:,:, 1)
      rate(:,:,217) = rate(:,:,217) * inv(:,:, 1)
      rate(:,:,218) = rate(:,:,218) * inv(:,:, 1)
      rate(:,:,233) = rate(:,:,233) * inv(:,:, 1)
      rate(:,:,253) = rate(:,:,253) * inv(:,:, 1)
      rate(:,:,254) = rate(:,:,254) * inv(:,:, 1)
      rate(:,:,264) = rate(:,:,264) * inv(:,:, 1)
      rate(:,:,311) = rate(:,:,311) * inv(:,:, 1)
      rate(:,:,312) = rate(:,:,312) * inv(:,:, 1)
      rate(:,:,319) = rate(:,:,319) * inv(:,:, 1)
      rate(:,:,320) = rate(:,:,320) * inv(:,:, 1)
      rate(:,:,321) = rate(:,:,321) * inv(:,:, 1)
      rate(:,:,347) = rate(:,:,347) * inv(:,:, 1)
      rate(:,:,348) = rate(:,:,348) * inv(:,:, 1)
      rate(:,:,349) = rate(:,:,349) * inv(:,:, 1)
      rate(:,:,368) = rate(:,:,368) * inv(:,:, 1)
      rate(:,:,394) = rate(:,:,394) * inv(:,:, 1)
      rate(:,:,397) = rate(:,:,397) * inv(:,:, 1)
      rate(:,:,398) = rate(:,:,398) * inv(:,:, 1)
      rate(:,:,456) = rate(:,:,456) * inv(:,:, 1)
      rate(:,:,459) = rate(:,:,459) * inv(:,:, 1)
      rate(:,:,462) = rate(:,:,462) * inv(:,:, 1)
      rate(:,:,469) = rate(:,:,469) * inv(:,:, 1)
      rate(:,:,474) = rate(:,:,474) * inv(:,:, 1)
      rate(:,:,560) = rate(:,:,560) * inv(:,:, 2)
      rate(:,:,563) = rate(:,:,563) * inv(:,:, 2)
      rate(:,:,155) = rate(:,:,155) * m(:,:)
      rate(:,:,156) = rate(:,:,156) * m(:,:)
      rate(:,:,157) = rate(:,:,157) * m(:,:)
      rate(:,:,158) = rate(:,:,158) * m(:,:)
      rate(:,:,159) = rate(:,:,159) * m(:,:)
      rate(:,:,161) = rate(:,:,161) * m(:,:)
      rate(:,:,162) = rate(:,:,162) * m(:,:)
      rate(:,:,163) = rate(:,:,163) * m(:,:)
      rate(:,:,165) = rate(:,:,165) * m(:,:)
      rate(:,:,166) = rate(:,:,166) * m(:,:)
      rate(:,:,167) = rate(:,:,167) * m(:,:)
      rate(:,:,169) = rate(:,:,169) * m(:,:)
      rate(:,:,170) = rate(:,:,170) * m(:,:)
      rate(:,:,171) = rate(:,:,171) * m(:,:)
      rate(:,:,172) = rate(:,:,172) * m(:,:)
      rate(:,:,173) = rate(:,:,173) * m(:,:)
      rate(:,:,174) = rate(:,:,174) * m(:,:)
      rate(:,:,175) = rate(:,:,175) * m(:,:)
      rate(:,:,176) = rate(:,:,176) * m(:,:)
      rate(:,:,177) = rate(:,:,177) * m(:,:)
      rate(:,:,178) = rate(:,:,178) * m(:,:)
      rate(:,:,179) = rate(:,:,179) * m(:,:)
      rate(:,:,180) = rate(:,:,180) * m(:,:)
      rate(:,:,181) = rate(:,:,181) * m(:,:)
      rate(:,:,182) = rate(:,:,182) * m(:,:)
      rate(:,:,183) = rate(:,:,183) * m(:,:)
      rate(:,:,184) = rate(:,:,184) * m(:,:)
      rate(:,:,185) = rate(:,:,185) * m(:,:)
      rate(:,:,186) = rate(:,:,186) * m(:,:)
      rate(:,:,187) = rate(:,:,187) * m(:,:)
      rate(:,:,188) = rate(:,:,188) * m(:,:)
      rate(:,:,189) = rate(:,:,189) * m(:,:)
      rate(:,:,190) = rate(:,:,190) * m(:,:)
      rate(:,:,191) = rate(:,:,191) * m(:,:)
      rate(:,:,192) = rate(:,:,192) * m(:,:)
      rate(:,:,193) = rate(:,:,193) * m(:,:)
      rate(:,:,194) = rate(:,:,194) * m(:,:)
      rate(:,:,195) = rate(:,:,195) * m(:,:)
      rate(:,:,196) = rate(:,:,196) * m(:,:)
      rate(:,:,197) = rate(:,:,197) * m(:,:)
      rate(:,:,198) = rate(:,:,198) * m(:,:)
      rate(:,:,199) = rate(:,:,199) * m(:,:)
      rate(:,:,200) = rate(:,:,200) * m(:,:)
      rate(:,:,201) = rate(:,:,201) * m(:,:)
      rate(:,:,202) = rate(:,:,202) * m(:,:)
      rate(:,:,203) = rate(:,:,203) * m(:,:)
      rate(:,:,204) = rate(:,:,204) * m(:,:)
      rate(:,:,205) = rate(:,:,205) * m(:,:)
      rate(:,:,206) = rate(:,:,206) * m(:,:)
      rate(:,:,207) = rate(:,:,207) * m(:,:)
      rate(:,:,208) = rate(:,:,208) * m(:,:)
      rate(:,:,209) = rate(:,:,209) * m(:,:)
      rate(:,:,210) = rate(:,:,210) * m(:,:)
      rate(:,:,211) = rate(:,:,211) * m(:,:)
      rate(:,:,212) = rate(:,:,212) * m(:,:)
      rate(:,:,213) = rate(:,:,213) * m(:,:)
      rate(:,:,214) = rate(:,:,214) * m(:,:)
      rate(:,:,215) = rate(:,:,215) * m(:,:)
      rate(:,:,216) = rate(:,:,216) * m(:,:)
      rate(:,:,219) = rate(:,:,219) * m(:,:)
      rate(:,:,220) = rate(:,:,220) * m(:,:)
      rate(:,:,221) = rate(:,:,221) * m(:,:)
      rate(:,:,222) = rate(:,:,222) * m(:,:)
      rate(:,:,223) = rate(:,:,223) * m(:,:)
      rate(:,:,224) = rate(:,:,224) * m(:,:)
      rate(:,:,225) = rate(:,:,225) * m(:,:)
      rate(:,:,226) = rate(:,:,226) * m(:,:)
      rate(:,:,227) = rate(:,:,227) * m(:,:)
      rate(:,:,228) = rate(:,:,228) * m(:,:)
      rate(:,:,229) = rate(:,:,229) * m(:,:)
      rate(:,:,230) = rate(:,:,230) * m(:,:)
      rate(:,:,231) = rate(:,:,231) * m(:,:)
      rate(:,:,232) = rate(:,:,232) * m(:,:)
      rate(:,:,233) = rate(:,:,233) * m(:,:)
      rate(:,:,234) = rate(:,:,234) * m(:,:)
      rate(:,:,235) = rate(:,:,235) * m(:,:)
      rate(:,:,236) = rate(:,:,236) * m(:,:)
      rate(:,:,237) = rate(:,:,237) * m(:,:)
      rate(:,:,238) = rate(:,:,238) * m(:,:)
      rate(:,:,239) = rate(:,:,239) * m(:,:)
      rate(:,:,240) = rate(:,:,240) * m(:,:)
      rate(:,:,241) = rate(:,:,241) * m(:,:)
      rate(:,:,242) = rate(:,:,242) * m(:,:)
      rate(:,:,243) = rate(:,:,243) * m(:,:)
      rate(:,:,244) = rate(:,:,244) * m(:,:)
      rate(:,:,245) = rate(:,:,245) * m(:,:)
      rate(:,:,246) = rate(:,:,246) * m(:,:)
      rate(:,:,247) = rate(:,:,247) * m(:,:)
      rate(:,:,248) = rate(:,:,248) * m(:,:)
      rate(:,:,249) = rate(:,:,249) * m(:,:)
      rate(:,:,250) = rate(:,:,250) * m(:,:)
      rate(:,:,251) = rate(:,:,251) * m(:,:)
      rate(:,:,252) = rate(:,:,252) * m(:,:)
      rate(:,:,253) = rate(:,:,253) * m(:,:)
      rate(:,:,255) = rate(:,:,255) * m(:,:)
      rate(:,:,256) = rate(:,:,256) * m(:,:)
      rate(:,:,257) = rate(:,:,257) * m(:,:)
      rate(:,:,258) = rate(:,:,258) * m(:,:)
      rate(:,:,259) = rate(:,:,259) * m(:,:)
      rate(:,:,260) = rate(:,:,260) * m(:,:)
      rate(:,:,261) = rate(:,:,261) * m(:,:)
      rate(:,:,262) = rate(:,:,262) * m(:,:)
      rate(:,:,263) = rate(:,:,263) * m(:,:)
      rate(:,:,264) = rate(:,:,264) * m(:,:)
      rate(:,:,265) = rate(:,:,265) * m(:,:)
      rate(:,:,266) = rate(:,:,266) * m(:,:)
      rate(:,:,267) = rate(:,:,267) * m(:,:)
      rate(:,:,268) = rate(:,:,268) * m(:,:)
      rate(:,:,269) = rate(:,:,269) * m(:,:)
      rate(:,:,270) = rate(:,:,270) * m(:,:)
      rate(:,:,271) = rate(:,:,271) * m(:,:)
      rate(:,:,272) = rate(:,:,272) * m(:,:)
      rate(:,:,273) = rate(:,:,273) * m(:,:)
      rate(:,:,274) = rate(:,:,274) * m(:,:)
      rate(:,:,275) = rate(:,:,275) * m(:,:)
      rate(:,:,276) = rate(:,:,276) * m(:,:)
      rate(:,:,277) = rate(:,:,277) * m(:,:)
      rate(:,:,278) = rate(:,:,278) * m(:,:)
      rate(:,:,279) = rate(:,:,279) * m(:,:)
      rate(:,:,280) = rate(:,:,280) * m(:,:)
      rate(:,:,281) = rate(:,:,281) * m(:,:)
      rate(:,:,282) = rate(:,:,282) * m(:,:)
      rate(:,:,283) = rate(:,:,283) * m(:,:)
      rate(:,:,284) = rate(:,:,284) * m(:,:)
      rate(:,:,285) = rate(:,:,285) * m(:,:)
      rate(:,:,286) = rate(:,:,286) * m(:,:)
      rate(:,:,287) = rate(:,:,287) * m(:,:)
      rate(:,:,288) = rate(:,:,288) * m(:,:)
      rate(:,:,289) = rate(:,:,289) * m(:,:)
      rate(:,:,290) = rate(:,:,290) * m(:,:)
      rate(:,:,291) = rate(:,:,291) * m(:,:)
      rate(:,:,292) = rate(:,:,292) * m(:,:)
      rate(:,:,293) = rate(:,:,293) * m(:,:)
      rate(:,:,294) = rate(:,:,294) * m(:,:)
      rate(:,:,295) = rate(:,:,295) * m(:,:)
      rate(:,:,296) = rate(:,:,296) * m(:,:)
      rate(:,:,297) = rate(:,:,297) * m(:,:)
      rate(:,:,298) = rate(:,:,298) * m(:,:)
      rate(:,:,299) = rate(:,:,299) * m(:,:)
      rate(:,:,300) = rate(:,:,300) * m(:,:)
      rate(:,:,301) = rate(:,:,301) * m(:,:)
      rate(:,:,302) = rate(:,:,302) * m(:,:)
      rate(:,:,303) = rate(:,:,303) * m(:,:)
      rate(:,:,304) = rate(:,:,304) * m(:,:)
      rate(:,:,305) = rate(:,:,305) * m(:,:)
      rate(:,:,306) = rate(:,:,306) * m(:,:)
      rate(:,:,307) = rate(:,:,307) * m(:,:)
      rate(:,:,308) = rate(:,:,308) * m(:,:)
      rate(:,:,309) = rate(:,:,309) * m(:,:)
      rate(:,:,310) = rate(:,:,310) * m(:,:)
      rate(:,:,311) = rate(:,:,311) * m(:,:)
      rate(:,:,312) = rate(:,:,312) * m(:,:)
      rate(:,:,313) = rate(:,:,313) * m(:,:)
      rate(:,:,314) = rate(:,:,314) * m(:,:)
      rate(:,:,316) = rate(:,:,316) * m(:,:)
      rate(:,:,317) = rate(:,:,317) * m(:,:)
      rate(:,:,318) = rate(:,:,318) * m(:,:)
      rate(:,:,319) = rate(:,:,319) * m(:,:)
      rate(:,:,320) = rate(:,:,320) * m(:,:)
      rate(:,:,321) = rate(:,:,321) * m(:,:)
      rate(:,:,322) = rate(:,:,322) * m(:,:)
      rate(:,:,323) = rate(:,:,323) * m(:,:)
      rate(:,:,324) = rate(:,:,324) * m(:,:)
      rate(:,:,325) = rate(:,:,325) * m(:,:)
      rate(:,:,326) = rate(:,:,326) * m(:,:)
      rate(:,:,327) = rate(:,:,327) * m(:,:)
      rate(:,:,328) = rate(:,:,328) * m(:,:)
      rate(:,:,329) = rate(:,:,329) * m(:,:)
      rate(:,:,330) = rate(:,:,330) * m(:,:)
      rate(:,:,331) = rate(:,:,331) * m(:,:)
      rate(:,:,332) = rate(:,:,332) * m(:,:)
      rate(:,:,333) = rate(:,:,333) * m(:,:)
      rate(:,:,334) = rate(:,:,334) * m(:,:)
      rate(:,:,335) = rate(:,:,335) * m(:,:)
      rate(:,:,336) = rate(:,:,336) * m(:,:)
      rate(:,:,337) = rate(:,:,337) * m(:,:)
      rate(:,:,338) = rate(:,:,338) * m(:,:)
      rate(:,:,339) = rate(:,:,339) * m(:,:)
      rate(:,:,340) = rate(:,:,340) * m(:,:)
      rate(:,:,341) = rate(:,:,341) * m(:,:)
      rate(:,:,343) = rate(:,:,343) * m(:,:)
      rate(:,:,344) = rate(:,:,344) * m(:,:)
      rate(:,:,345) = rate(:,:,345) * m(:,:)
      rate(:,:,346) = rate(:,:,346) * m(:,:)
      rate(:,:,347) = rate(:,:,347) * m(:,:)
      rate(:,:,348) = rate(:,:,348) * m(:,:)
      rate(:,:,350) = rate(:,:,350) * m(:,:)
      rate(:,:,351) = rate(:,:,351) * m(:,:)
      rate(:,:,352) = rate(:,:,352) * m(:,:)
      rate(:,:,353) = rate(:,:,353) * m(:,:)
      rate(:,:,354) = rate(:,:,354) * m(:,:)
      rate(:,:,355) = rate(:,:,355) * m(:,:)
      rate(:,:,356) = rate(:,:,356) * m(:,:)
      rate(:,:,357) = rate(:,:,357) * m(:,:)
      rate(:,:,358) = rate(:,:,358) * m(:,:)
      rate(:,:,359) = rate(:,:,359) * m(:,:)
      rate(:,:,360) = rate(:,:,360) * m(:,:)
      rate(:,:,361) = rate(:,:,361) * m(:,:)
      rate(:,:,362) = rate(:,:,362) * m(:,:)
      rate(:,:,363) = rate(:,:,363) * m(:,:)
      rate(:,:,364) = rate(:,:,364) * m(:,:)
      rate(:,:,365) = rate(:,:,365) * m(:,:)
      rate(:,:,366) = rate(:,:,366) * m(:,:)
      rate(:,:,367) = rate(:,:,367) * m(:,:)
      rate(:,:,368) = rate(:,:,368) * m(:,:)
      rate(:,:,369) = rate(:,:,369) * m(:,:)
      rate(:,:,370) = rate(:,:,370) * m(:,:)
      rate(:,:,371) = rate(:,:,371) * m(:,:)
      rate(:,:,372) = rate(:,:,372) * m(:,:)
      rate(:,:,373) = rate(:,:,373) * m(:,:)
      rate(:,:,374) = rate(:,:,374) * m(:,:)
      rate(:,:,375) = rate(:,:,375) * m(:,:)
      rate(:,:,376) = rate(:,:,376) * m(:,:)
      rate(:,:,377) = rate(:,:,377) * m(:,:)
      rate(:,:,378) = rate(:,:,378) * m(:,:)
      rate(:,:,379) = rate(:,:,379) * m(:,:)
      rate(:,:,380) = rate(:,:,380) * m(:,:)
      rate(:,:,381) = rate(:,:,381) * m(:,:)
      rate(:,:,382) = rate(:,:,382) * m(:,:)
      rate(:,:,383) = rate(:,:,383) * m(:,:)
      rate(:,:,384) = rate(:,:,384) * m(:,:)
      rate(:,:,385) = rate(:,:,385) * m(:,:)
      rate(:,:,386) = rate(:,:,386) * m(:,:)
      rate(:,:,387) = rate(:,:,387) * m(:,:)
      rate(:,:,388) = rate(:,:,388) * m(:,:)
      rate(:,:,389) = rate(:,:,389) * m(:,:)
      rate(:,:,390) = rate(:,:,390) * m(:,:)
      rate(:,:,391) = rate(:,:,391) * m(:,:)
      rate(:,:,392) = rate(:,:,392) * m(:,:)
      rate(:,:,393) = rate(:,:,393) * m(:,:)
      rate(:,:,394) = rate(:,:,394) * m(:,:)
      rate(:,:,395) = rate(:,:,395) * m(:,:)
      rate(:,:,396) = rate(:,:,396) * m(:,:)
      rate(:,:,397) = rate(:,:,397) * m(:,:)
      rate(:,:,399) = rate(:,:,399) * m(:,:)
      rate(:,:,400) = rate(:,:,400) * m(:,:)
      rate(:,:,401) = rate(:,:,401) * m(:,:)
      rate(:,:,402) = rate(:,:,402) * m(:,:)
      rate(:,:,403) = rate(:,:,403) * m(:,:)
      rate(:,:,404) = rate(:,:,404) * m(:,:)
      rate(:,:,405) = rate(:,:,405) * m(:,:)
      rate(:,:,406) = rate(:,:,406) * m(:,:)
      rate(:,:,407) = rate(:,:,407) * m(:,:)
      rate(:,:,408) = rate(:,:,408) * m(:,:)
      rate(:,:,409) = rate(:,:,409) * m(:,:)
      rate(:,:,410) = rate(:,:,410) * m(:,:)
      rate(:,:,411) = rate(:,:,411) * m(:,:)
      rate(:,:,412) = rate(:,:,412) * m(:,:)
      rate(:,:,413) = rate(:,:,413) * m(:,:)
      rate(:,:,414) = rate(:,:,414) * m(:,:)
      rate(:,:,415) = rate(:,:,415) * m(:,:)
      rate(:,:,417) = rate(:,:,417) * m(:,:)
      rate(:,:,418) = rate(:,:,418) * m(:,:)
      rate(:,:,419) = rate(:,:,419) * m(:,:)
      rate(:,:,420) = rate(:,:,420) * m(:,:)
      rate(:,:,421) = rate(:,:,421) * m(:,:)
      rate(:,:,422) = rate(:,:,422) * m(:,:)
      rate(:,:,423) = rate(:,:,423) * m(:,:)
      rate(:,:,424) = rate(:,:,424) * m(:,:)
      rate(:,:,425) = rate(:,:,425) * m(:,:)
      rate(:,:,426) = rate(:,:,426) * m(:,:)
      rate(:,:,427) = rate(:,:,427) * m(:,:)
      rate(:,:,428) = rate(:,:,428) * m(:,:)
      rate(:,:,429) = rate(:,:,429) * m(:,:)
      rate(:,:,430) = rate(:,:,430) * m(:,:)
      rate(:,:,431) = rate(:,:,431) * m(:,:)
      rate(:,:,432) = rate(:,:,432) * m(:,:)
      rate(:,:,433) = rate(:,:,433) * m(:,:)
      rate(:,:,434) = rate(:,:,434) * m(:,:)
      rate(:,:,435) = rate(:,:,435) * m(:,:)
      rate(:,:,436) = rate(:,:,436) * m(:,:)
      rate(:,:,437) = rate(:,:,437) * m(:,:)
      rate(:,:,438) = rate(:,:,438) * m(:,:)
      rate(:,:,439) = rate(:,:,439) * m(:,:)
      rate(:,:,440) = rate(:,:,440) * m(:,:)
      rate(:,:,441) = rate(:,:,441) * m(:,:)
      rate(:,:,442) = rate(:,:,442) * m(:,:)
      rate(:,:,443) = rate(:,:,443) * m(:,:)
      rate(:,:,444) = rate(:,:,444) * m(:,:)
      rate(:,:,445) = rate(:,:,445) * m(:,:)
      rate(:,:,446) = rate(:,:,446) * m(:,:)
      rate(:,:,447) = rate(:,:,447) * m(:,:)
      rate(:,:,448) = rate(:,:,448) * m(:,:)
      rate(:,:,449) = rate(:,:,449) * m(:,:)
      rate(:,:,450) = rate(:,:,450) * m(:,:)
      rate(:,:,451) = rate(:,:,451) * m(:,:)
      rate(:,:,452) = rate(:,:,452) * m(:,:)
      rate(:,:,453) = rate(:,:,453) * m(:,:)
      rate(:,:,454) = rate(:,:,454) * m(:,:)
      rate(:,:,455) = rate(:,:,455) * m(:,:)
      rate(:,:,456) = rate(:,:,456) * m(:,:)
      rate(:,:,457) = rate(:,:,457) * m(:,:)
      rate(:,:,458) = rate(:,:,458) * m(:,:)
      rate(:,:,459) = rate(:,:,459) * m(:,:)
      rate(:,:,460) = rate(:,:,460) * m(:,:)
      rate(:,:,461) = rate(:,:,461) * m(:,:)
      rate(:,:,462) = rate(:,:,462) * m(:,:)
      rate(:,:,463) = rate(:,:,463) * m(:,:)
      rate(:,:,464) = rate(:,:,464) * m(:,:)
      rate(:,:,465) = rate(:,:,465) * m(:,:)
      rate(:,:,466) = rate(:,:,466) * m(:,:)
      rate(:,:,467) = rate(:,:,467) * m(:,:)
      rate(:,:,468) = rate(:,:,468) * m(:,:)
      rate(:,:,469) = rate(:,:,469) * m(:,:)
      rate(:,:,470) = rate(:,:,470) * m(:,:)
      rate(:,:,471) = rate(:,:,471) * m(:,:)
      rate(:,:,472) = rate(:,:,472) * m(:,:)
      rate(:,:,473) = rate(:,:,473) * m(:,:)
      rate(:,:,475) = rate(:,:,475) * m(:,:)
      rate(:,:,476) = rate(:,:,476) * m(:,:)
      rate(:,:,477) = rate(:,:,477) * m(:,:)
      rate(:,:,478) = rate(:,:,478) * m(:,:)
      rate(:,:,479) = rate(:,:,479) * m(:,:)
      rate(:,:,480) = rate(:,:,480) * m(:,:)
      rate(:,:,481) = rate(:,:,481) * m(:,:)
      rate(:,:,482) = rate(:,:,482) * m(:,:)
      rate(:,:,483) = rate(:,:,483) * m(:,:)
      rate(:,:,484) = rate(:,:,484) * m(:,:)
      rate(:,:,485) = rate(:,:,485) * m(:,:)
      rate(:,:,486) = rate(:,:,486) * m(:,:)
      rate(:,:,487) = rate(:,:,487) * m(:,:)
      rate(:,:,488) = rate(:,:,488) * m(:,:)
      rate(:,:,489) = rate(:,:,489) * m(:,:)
      rate(:,:,490) = rate(:,:,490) * m(:,:)
      rate(:,:,491) = rate(:,:,491) * m(:,:)
      rate(:,:,492) = rate(:,:,492) * m(:,:)
      rate(:,:,493) = rate(:,:,493) * m(:,:)
      rate(:,:,494) = rate(:,:,494) * m(:,:)
      rate(:,:,495) = rate(:,:,495) * m(:,:)
      rate(:,:,496) = rate(:,:,496) * m(:,:)
      rate(:,:,497) = rate(:,:,497) * m(:,:)
      rate(:,:,498) = rate(:,:,498) * m(:,:)
      rate(:,:,499) = rate(:,:,499) * m(:,:)
      rate(:,:,500) = rate(:,:,500) * m(:,:)
      rate(:,:,501) = rate(:,:,501) * m(:,:)
      rate(:,:,502) = rate(:,:,502) * m(:,:)
      rate(:,:,503) = rate(:,:,503) * m(:,:)
      rate(:,:,504) = rate(:,:,504) * m(:,:)
      rate(:,:,505) = rate(:,:,505) * m(:,:)
      rate(:,:,506) = rate(:,:,506) * m(:,:)
      rate(:,:,507) = rate(:,:,507) * m(:,:)
      rate(:,:,508) = rate(:,:,508) * m(:,:)
      rate(:,:,509) = rate(:,:,509) * m(:,:)
      rate(:,:,510) = rate(:,:,510) * m(:,:)
      rate(:,:,511) = rate(:,:,511) * m(:,:)
      rate(:,:,512) = rate(:,:,512) * m(:,:)
      rate(:,:,513) = rate(:,:,513) * m(:,:)
      rate(:,:,514) = rate(:,:,514) * m(:,:)
      rate(:,:,515) = rate(:,:,515) * m(:,:)
      rate(:,:,516) = rate(:,:,516) * m(:,:)
      rate(:,:,517) = rate(:,:,517) * m(:,:)
      rate(:,:,518) = rate(:,:,518) * m(:,:)
      rate(:,:,519) = rate(:,:,519) * m(:,:)
      rate(:,:,520) = rate(:,:,520) * m(:,:)
      rate(:,:,521) = rate(:,:,521) * m(:,:)
      rate(:,:,522) = rate(:,:,522) * m(:,:)
      rate(:,:,523) = rate(:,:,523) * m(:,:)
      rate(:,:,531) = rate(:,:,531) * m(:,:)
      rate(:,:,532) = rate(:,:,532) * m(:,:)
      rate(:,:,534) = rate(:,:,534) * m(:,:)
      rate(:,:,539) = rate(:,:,539) * m(:,:)
      rate(:,:,540) = rate(:,:,540) * m(:,:)
      rate(:,:,541) = rate(:,:,541) * m(:,:)
      rate(:,:,544) = rate(:,:,544) * m(:,:)
      rate(:,:,545) = rate(:,:,545) * m(:,:)
      rate(:,:,546) = rate(:,:,546) * m(:,:)
      rate(:,:,549) = rate(:,:,549) * m(:,:)
      rate(:,:,550) = rate(:,:,550) * m(:,:)
      rate(:,:,551) = rate(:,:,551) * m(:,:)
      rate(:,:,552) = rate(:,:,552) * m(:,:)
      rate(:,:,553) = rate(:,:,553) * m(:,:)
      rate(:,:,554) = rate(:,:,554) * m(:,:)
      rate(:,:,555) = rate(:,:,555) * m(:,:)
      rate(:,:,556) = rate(:,:,556) * m(:,:)
      rate(:,:,557) = rate(:,:,557) * m(:,:)
      rate(:,:,558) = rate(:,:,558) * m(:,:)
      rate(:,:,559) = rate(:,:,559) * m(:,:)
      rate(:,:,561) = rate(:,:,561) * m(:,:)
      rate(:,:,562) = rate(:,:,562) * m(:,:)
      rate(:,:,564) = rate(:,:,564) * m(:,:)
      rate(:,:,565) = rate(:,:,565) * m(:,:)
      rate(:,:,566) = rate(:,:,566) * m(:,:)
      rate(:,:,567) = rate(:,:,567) * m(:,:)
      rate(:,:,568) = rate(:,:,568) * m(:,:)
      rate(:,:,569) = rate(:,:,569) * m(:,:)
      rate(:,:,570) = rate(:,:,570) * m(:,:)
      rate(:,:,571) = rate(:,:,571) * m(:,:)
      rate(:,:,572) = rate(:,:,572) * m(:,:)
      rate(:,:,573) = rate(:,:,573) * m(:,:)
      rate(:,:,574) = rate(:,:,574) * m(:,:)
      rate(:,:,575) = rate(:,:,575) * m(:,:)
      rate(:,:,576) = rate(:,:,576) * m(:,:)
      rate(:,:,577) = rate(:,:,577) * m(:,:)
      rate(:,:,578) = rate(:,:,578) * m(:,:)
      rate(:,:,579) = rate(:,:,579) * m(:,:)
      end subroutine adjrxt
      end module mo_adjrxt
      module mo_phtadj
      private
      public :: phtadj
      contains
      subroutine phtadj( p_rate, inv, m, ncol, nlev )
      use chem_mods, only : nfs, phtcnt
      use shr_kind_mod, only : r8 => shr_kind_r8
      implicit none
!--------------------------------------------------------------------
! ... dummy arguments
!--------------------------------------------------------------------
      integer, intent(in) :: ncol, nlev
      real(r8), intent(in) :: inv(ncol,nlev,max(1,nfs))
      real(r8), intent(in) :: m(ncol,nlev)
      real(r8), intent(inout) :: p_rate(ncol,nlev,max(1,phtcnt))
!--------------------------------------------------------------------
! ... local variables
!--------------------------------------------------------------------
      integer :: k
      real(r8) :: im(ncol,nlev)
      do k = 1,nlev
         im(:ncol,k) = 1._r8 / m(:ncol,k)
         p_rate(:,k,112) = p_rate(:,k,112) * inv(:,k, 2) * im(:,k)
         p_rate(:,k,113) = p_rate(:,k,113) * inv(:,k, 2) * im(:,k)
         p_rate(:,k,114) = p_rate(:,k,114) * inv(:,k, 2) * im(:,k)
         p_rate(:,k,115) = p_rate(:,k,115) * inv(:,k, 2) * im(:,k)
         p_rate(:,k,116) = p_rate(:,k,116) * inv(:,k, 2) * im(:,k)
         p_rate(:,k,117) = p_rate(:,k,117) * inv(:,k, 2) * im(:,k)
         p_rate(:,k,118) = p_rate(:,k,118) * inv(:,k, 2) * im(:,k)
         p_rate(:,k,119) = p_rate(:,k,119) * inv(:,k, 2) * im(:,k)
      end do
      end subroutine phtadj
      end module mo_phtadj
      module mo_sim_dat
      private
      public :: set_sim_dat
      contains
      subroutine set_sim_dat
      use chem_mods, only : clscnt, cls_rxt_cnt, clsmap, permute, adv_mass, fix_mass, crb_mass
      use chem_mods, only : diag_map
      use chem_mods, only : phtcnt, rxt_tag_cnt, rxt_tag_lst, rxt_tag_map
      use chem_mods, only : pht_alias_lst, pht_alias_mult
      use chem_mods, only : extfrc_lst, inv_lst, slvd_lst
      use chem_mods, only : enthalpy_cnt, cph_enthalpy, cph_rid
      use cam_abortutils,only : endrun
      use mo_tracname, only : solsym
      use chem_mods, only : frc_from_dataset
      use chem_mods, only : is_scalar, is_vector
      use shr_kind_mod, only : r8 => shr_kind_r8
      use cam_logfile, only : iulog
      implicit none
!--------------------------------------------------------------
! ... local variables
!--------------------------------------------------------------
      integer :: ios
      is_scalar = .true.
      is_vector = .false.
      clscnt(:) = (/ 26, 0, 0, 203, 0 /)
      cls_rxt_cnt(:,1) = (/ 36, 77, 0, 26 /)
      cls_rxt_cnt(:,4) = (/ 31, 189, 342, 203 /)
      solsym(:229) = (/ 'ACBZO2          ','ALKNIT          ','ALKO2           ','ALKOOH          ','BCARY           ', &
                        'BENZENE         ','BENZO2          ','BENZOOH         ','BEPOMUC         ','BIGALD          ', &
                        'BIGALD1         ','BIGALD2         ','BIGALD3         ','BIGALD4         ','BIGALK          ', &
                        'BIGENE          ','BR              ','BRCL            ','BRO             ','BRONO2          ', &
                        'BZALD           ','BZOO            ','BZOOH           ','C2H2            ','C2H4            ', &
                        'C2H5O2          ','C2H5OH          ','C2H5OOH         ','C2H6            ','C3H6            ', &
                        'C3H7O2          ','C3H7OOH         ','C3H8            ','C6H5O2          ','C6H5OOH         ', &
                        'CCL4            ','CF2CLBR         ','CF3BR           ','CFC11           ','CFC113          ', &
                        'CFC114          ','CFC115          ','CFC12           ','CH2BR2          ','CH2O            ', &
                        'CH3BR           ','CH3CCL3         ','CH3CHO          ','CH3CL           ','CH3CN           ', &
                        'CH3CO3          ','CH3COCH3        ','CH3COCHO        ','CH3COOH         ','CH3COOOH        ', &
                        'CH3O2           ','CH3OH           ','CH3OOH          ','CH4             ','CHBR3           ', &
                        'CL              ','CL2             ','CL2O2           ','CLO             ','CLONO2          ', &
                        'CO              ','CO2             ','COF2            ','COFCL           ','CRESOL          ', &
                        'DICARBO2        ','DMS             ','e               ','ENEO2           ','EO              ', &
                        'EO2             ','EOOH            ','F               ','GLYALD          ','GLYOXAL         ', &
                        'H               ','H1202           ','H2              ','H2402           ','H2O2            ', &
                        'H2SO4           ','HBR             ','HCFC141B        ','HCFC142B        ','HCFC22          ', &
                        'HCL             ','HCN             ','HCOOH           ','HF              ','HNO3            ', &
                        'HO2             ','HO2NO2          ','HOBR            ','HOCH2OO         ','HOCL            ', &
                        'HONITR          ','HPALD           ','HYAC            ','HYDRALD         ','IEPOX           ', &
                        'ISOP            ','ISOPAO2         ','ISOPBO2         ','ISOPNITA        ','ISOPNITB        ', &
                        'ISOPNO3         ','ISOPNOOH        ','ISOPOOH         ','IVOC            ','MACR            ', &
                        'MACRO2          ','MACROOH         ','MALO2           ','MCO3            ','MDIALO2         ', &
                        'MEK             ','MEKO2           ','MEKOOH          ','MPAN            ','MTERP           ', &
                        'MVK             ','N               ','N2              ','N2D             ','N2O             ', &
                        'N2O5            ','N2p             ','NC4CH2OH        ','NC4CHO          ','NH3             ', &
                        'NH4             ','NH4NO3          ','NO              ','NO2             ','NO3             ', &
                        'NOA             ','NOp             ','Np              ','NTERPO2         ','NTERPOOH        ', &
                        'O               ','O1D             ','O2              ','O2_1D           ','O2_1S           ', &
                        'O2p             ','O3              ','O3S             ','OCLO            ','OCS             ', &
                        'OH              ','ONITR           ','Op              ','PAN             ','PBZNIT          ', &
                        'PHENO           ','PHENO2          ','PHENOL          ','PHENOOH         ','PO2             ', &
                        'POOH            ','RO2             ','ROOH            ','S               ','SO              ', &
                        'SO2             ','SO3             ','soa1_a1         ','soa1_a2         ','soa2_a1         ', &
                        'soa2_a2         ','soa3_a1         ','soa3_a2         ','soa4_a1         ','soa4_a2         ', &
                        'soa5_a1         ','soa5_a2         ','SVOC            ','TEPOMUC         ','TERP2O2         ', &
                        'TERP2OOH        ','TERPNIT         ','TERPO2          ','TERPOOH         ','TERPROD1        ', &
                        'TERPROD2        ','TOLO2           ','TOLOOH          ','TOLUENE         ','XO2             ', &
                        'XOOH            ','XYLENES         ','XYLENO2         ','XYLENOOH        ','XYLOL           ', &
                        'XYLOLO2         ','XYLOLOOH        ','NDEP            ','NHDEP           ','bc_a1           ', &
                        'bc_a4           ','BRY             ','CLY             ','dst_a1          ','dst_a2          ', &
                        'dst_a3          ','ncl_a1          ','ncl_a2          ','ncl_a3          ','num_a1          ', &
                        'num_a2          ','num_a3          ','num_a4          ','pom_a1          ','pom_a4          ', &
                        'so4_a1          ','so4_a2          ','so4_a3          ','SOAG0           ','SOAG1           ', &
                        'SOAG2           ','SOAG3           ','SOAG4           ','H2O             ' /)
      adv_mass(:229) = (/ 137.112200_r8, 133.141340_r8, 103.135200_r8, 104.142600_r8, 204.342600_r8, &
                             78.110400_r8, 159.114800_r8, 160.122200_r8, 126.108600_r8, 98.098200_r8, &
                             84.072400_r8, 98.098200_r8, 98.098200_r8, 112.124000_r8, 72.143800_r8, &
                             56.103200_r8, 79.904000_r8, 115.356700_r8, 95.903400_r8, 141.908940_r8, &
                            106.120800_r8, 123.127600_r8, 124.135000_r8, 26.036800_r8, 28.051600_r8, &
                             61.057800_r8, 46.065800_r8, 62.065200_r8, 30.066400_r8, 42.077400_r8, &
                             75.083600_r8, 76.091000_r8, 44.092200_r8, 109.101800_r8, 110.109200_r8, &
                            153.821800_r8, 165.364506_r8, 148.910210_r8, 137.367503_r8, 187.375310_r8, &
                            170.921013_r8, 154.466716_r8, 120.913206_r8, 173.833800_r8, 30.025200_r8, &
                             94.937200_r8, 133.402300_r8, 44.051000_r8, 50.485900_r8, 41.050940_r8, &
                             75.042400_r8, 58.076800_r8, 72.061400_r8, 60.050400_r8, 76.049800_r8, &
                             47.032000_r8, 32.040000_r8, 48.039400_r8, 16.040600_r8, 252.730400_r8, &
                             35.452700_r8, 70.905400_r8, 102.904200_r8, 51.452100_r8, 97.457640_r8, &
                             28.010400_r8, 44.009800_r8, 66.007206_r8, 82.461503_r8, 108.135600_r8, &
                            129.089600_r8, 62.132400_r8, 0.00000_r8, 105.108800_r8, 61.057800_r8, &
                             77.057200_r8, 78.064600_r8, 18.998403_r8, 60.050400_r8, 58.035600_r8, &
                              1.007400_r8, 209.815806_r8, 2.014800_r8, 259.823613_r8, 34.013600_r8, &
                             98.078400_r8, 80.911400_r8, 116.948003_r8, 100.493706_r8, 86.467906_r8, &
                             36.460100_r8, 27.025140_r8, 46.024600_r8, 20.005803_r8, 63.012340_r8, &
                             33.006200_r8, 79.011740_r8, 96.910800_r8, 63.031400_r8, 52.459500_r8, &
                            133.100140_r8, 116.112400_r8, 74.076200_r8, 100.113000_r8, 118.127200_r8, &
                             68.114200_r8, 117.119800_r8, 117.119800_r8, 147.125940_r8, 147.125940_r8, &
                            162.117940_r8, 163.125340_r8, 118.127200_r8, 184.350200_r8, 70.087800_r8, &
                            119.093400_r8, 120.100800_r8, 115.063800_r8, 101.079200_r8, 117.078600_r8, &
                             72.102600_r8, 103.094000_r8, 104.101400_r8, 147.084740_r8, 136.228400_r8, &
                             70.087800_r8, 14.006740_r8, 28.013480_r8, 14.006740_r8, 44.012880_r8, &
                            108.010480_r8, 28.013480_r8, 147.125940_r8, 145.111140_r8, 17.028940_r8, &
                             18.036340_r8, 80.041280_r8, 30.006140_r8, 46.005540_r8, 62.004940_r8, &
                            119.074340_r8, 30.006140_r8, 14.006740_r8, 230.232140_r8, 231.239540_r8, &
                             15.999400_r8, 15.999400_r8, 31.998800_r8, 31.998800_r8, 31.998800_r8, &
                             31.998800_r8, 47.998200_r8, 47.998200_r8, 67.451500_r8, 60.076400_r8, &
                             17.006800_r8, 147.125940_r8, 15.999400_r8, 121.047940_r8, 183.117740_r8, &
                            159.114800_r8, 175.114200_r8, 94.109800_r8, 176.121600_r8, 91.083000_r8, &
                             92.090400_r8, 89.068200_r8, 90.075600_r8, 32.066000_r8, 48.065400_r8, &
                             64.064800_r8, 80.064200_r8, 250.445000_r8, 250.445000_r8, 250.445000_r8, &
                            250.445000_r8, 250.445000_r8, 250.445000_r8, 250.445000_r8, 250.445000_r8, &
                            250.445000_r8, 250.445000_r8, 310.582400_r8, 140.134400_r8, 199.218600_r8, &
                            200.226000_r8, 215.240140_r8, 185.234000_r8, 186.241400_r8, 168.227200_r8, &
                            154.201400_r8, 173.140600_r8, 174.148000_r8, 92.136200_r8, 149.118600_r8, &
                            150.126000_r8, 106.162000_r8, 187.166400_r8, 188.173800_r8, 122.161400_r8, &
                            203.165800_r8, 204.173200_r8, 30.974169_r8, 44.980909_r8, 12.011000_r8, &
                             12.011000_r8, 99.716850_r8, 100.916850_r8, 135.064039_r8, 135.064039_r8, &
                            135.064039_r8, 58.442468_r8, 58.442468_r8, 58.442468_r8, 1.007400_r8, &
                              1.007400_r8, 1.007400_r8, 1.007400_r8, 12.011000_r8, 12.011000_r8, &
                            115.107340_r8, 115.107340_r8, 115.107340_r8, 250.445000_r8, 250.445000_r8, &
                            250.445000_r8, 250.445000_r8, 250.445000_r8, 18.014200_r8 /)
      crb_mass(:229) = (/ 84.077000_r8, 60.055000_r8, 60.055000_r8, 60.055000_r8, 180.165000_r8, &
                             72.066000_r8, 72.066000_r8, 72.066000_r8, 72.066000_r8, 60.055000_r8, &
                             48.044000_r8, 60.055000_r8, 60.055000_r8, 72.066000_r8, 60.055000_r8, &
                             48.044000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                             84.077000_r8, 84.077000_r8, 84.077000_r8, 24.022000_r8, 24.022000_r8, &
                             24.022000_r8, 24.022000_r8, 24.022000_r8, 24.022000_r8, 36.033000_r8, &
                             36.033000_r8, 36.033000_r8, 36.033000_r8, 72.066000_r8, 72.066000_r8, &
                             12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, 24.022000_r8, &
                             24.022000_r8, 24.022000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, &
                             12.011000_r8, 24.022000_r8, 24.022000_r8, 12.011000_r8, 24.022000_r8, &
                             24.022000_r8, 36.033000_r8, 36.033000_r8, 24.022000_r8, 24.022000_r8, &
                             12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                             12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, 84.077000_r8, &
                             60.055000_r8, 24.022000_r8, 0.000000_r8, 48.044000_r8, 24.022000_r8, &
                             24.022000_r8, 24.022000_r8, 0.000000_r8, 24.022000_r8, 24.022000_r8, &
                              0.000000_r8, 12.011000_r8, 0.000000_r8, 24.022000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 24.022000_r8, 24.022000_r8, 12.011000_r8, &
                              0.000000_r8, 12.011000_r8, 12.011000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 12.011000_r8, 0.000000_r8, &
                             48.044000_r8, 60.055000_r8, 36.033000_r8, 60.055000_r8, 60.055000_r8, &
                             60.055000_r8, 60.055000_r8, 60.055000_r8, 60.055000_r8, 60.055000_r8, &
                             60.055000_r8, 60.055000_r8, 60.055000_r8, 156.143000_r8, 48.044000_r8, &
                             48.044000_r8, 48.044000_r8, 48.044000_r8, 48.044000_r8, 48.044000_r8, &
                             48.044000_r8, 48.044000_r8, 48.044000_r8, 48.044000_r8, 120.110000_r8, &
                             48.044000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 60.055000_r8, 60.055000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                             36.033000_r8, 0.000000_r8, 0.000000_r8, 120.110000_r8, 120.110000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 12.011000_r8, &
                              0.000000_r8, 60.055000_r8, 0.000000_r8, 24.022000_r8, 84.077000_r8, &
                             72.066000_r8, 72.066000_r8, 72.066000_r8, 72.066000_r8, 36.033000_r8, &
                             36.033000_r8, 36.033000_r8, 36.033000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 180.165000_r8, 180.165000_r8, 180.165000_r8, &
                            180.165000_r8, 180.165000_r8, 180.165000_r8, 180.165000_r8, 180.165000_r8, &
                            180.165000_r8, 180.165000_r8, 264.242000_r8, 84.077000_r8, 120.110000_r8, &
                            120.110000_r8, 120.110000_r8, 120.110000_r8, 120.110000_r8, 120.110000_r8, &
                            108.099000_r8, 84.077000_r8, 84.077000_r8, 84.077000_r8, 60.055000_r8, &
                             60.055000_r8, 96.088000_r8, 96.088000_r8, 96.088000_r8, 96.088000_r8, &
                             96.088000_r8, 96.088000_r8, 0.000000_r8, 0.000000_r8, 12.011000_r8, &
                             12.011000_r8, 0.000000_r8, 12.011000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 12.011000_r8, 12.011000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 180.165000_r8, 180.165000_r8, &
                            180.165000_r8, 180.165000_r8, 180.165000_r8, 0.000000_r8 /)
      fix_mass(: 2) = (/ 0.00000000_r8, 28.0134800_r8 /)
      clsmap(: 26,1) = (/ 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, &
                            47, 49, 59, 60, 67, 82, 84, 88, 89, 90, &
                           130, 153, 203, 204, 207, 208 /)
      clsmap(:203,4) = (/ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, &
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, &
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, &
                            31, 32, 33, 34, 35, 45, 48, 50, 51, 52, &
                            53, 54, 55, 56, 57, 58, 61, 62, 63, 64, &
                            65, 66, 68, 69, 70, 71, 72, 73, 74, 75, &
                            76, 77, 78, 79, 80, 81, 83, 85, 86, 87, &
                            91, 92, 93, 94, 95, 96, 97, 98, 99, 100, &
                           101, 102, 103, 104, 105, 106, 107, 108, 109, 110, &
                           111, 112, 113, 114, 115, 116, 117, 118, 119, 120, &
                           121, 122, 123, 124, 125, 126, 127, 128, 129, 131, &
                           132, 133, 134, 135, 136, 137, 138, 139, 140, 141, &
                           142, 143, 144, 145, 146, 147, 148, 149, 150, 151, &
                           152, 154, 155, 156, 157, 158, 159, 160, 161, 162, &
                           163, 164, 165, 166, 167, 168, 169, 170, 171, 172, &
                           173, 174, 175, 176, 177, 178, 179, 180, 181, 182, &
                           183, 184, 185, 186, 187, 188, 189, 190, 191, 192, &
                           193, 194, 195, 196, 197, 198, 199, 200, 201, 202, &
                           205, 206, 209, 210, 211, 212, 213, 214, 215, 216, &
                           217, 218, 219, 220, 221, 222, 223, 224, 225, 226, &
                           227, 228, 229 /)
      permute(:203,4) = (/ 107, 125, 159, 124, 156, 51, 104, 92, 52, 93, &
                             97, 72, 120, 82, 63, 86, 186, 64, 189, 117, &
                             65, 95, 83, 73, 118, 154, 68, 84, 74, 162, &
                            147, 96, 41, 123, 69, 199, 172, 38, 183, 160, &
                            176, 113, 111, 187, 144, 89, 198, 50, 39, 191, &
                            161, 169, 42, 54, 57, 135, 70, 138, 116, 98, &
                            141, 43, 140, 166, 153, 196, 173, 122, 44, 148, &
                            185, 55, 145, 61, 195, 197, 99, 139, 88, 149, &
                            168, 62, 170, 75, 45, 151, 179, 178, 112, 103, &
                            174, 87, 130, 36, 175, 180, 76, 133, 182, 165, &
                            109, 126, 77, 115, 157, 181, 146, 1, 108, 71, &
                            128, 78, 150, 40, 2, 3, 202, 192, 201, 143, &
                            137, 100, 163, 79, 193, 194, 188, 46, 47, 136, &
                            190, 80, 85, 200, 48, 119, 101, 49, 102, 90, &
                             53, 81, 142, 114, 171, 91, 129, 184, 155, 66, &
                              4, 5, 6, 7, 8, 9, 10, 11, 12, 13, &
                             37, 58, 167, 121, 110, 152, 105, 158, 164, 131, &
                            127, 56, 177, 67, 59, 134, 132, 60, 106, 94, &
                             14, 15, 16, 17, 18, 19, 20, 21, 22, 23, &
                             24, 25, 26, 27, 28, 29, 30, 31, 32, 33, &
                             34, 35, 203 /)
      diag_map(:203) = (/ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, &
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, &
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, &
                            31, 32, 33, 34, 35, 41, 47, 48, 51, 54, &
                            57, 61, 64, 67, 70, 74, 78, 80, 82, 85, &
                            92, 98, 102, 107, 111, 120, 127, 132, 142, 150, &
                           155, 158, 163, 166, 169, 173, 177, 181, 185, 189, &
                           195, 201, 204, 210, 216, 219, 224, 229, 234, 239, &
                           244, 249, 255, 260, 265, 273, 281, 287, 293, 300, &
                           306, 312, 318, 324, 332, 338, 344, 347, 352, 359, &
                           366, 373, 377, 386, 393, 401, 409, 415, 420, 425, &
                           430, 436, 444, 448, 456, 464, 472, 480, 488, 495, &
                           499, 508, 517, 524, 535, 546, 556, 569, 579, 587, &
                           598, 613, 624, 636, 647, 655, 664, 675, 683, 692, &
                           702, 711, 721, 726, 730, 740, 750, 761, 770, 779, &
                           793, 812, 822, 829, 839, 855, 884, 903, 916, 927, &
                           935, 949, 968, 980, 990, 999,1010,1024,1036,1040, &
                          1049,1060,1071,1092,1108,1120,1135,1165,1193,1218, &
                          1238,1258,1290,1306,1325,1340,1385,1417,1440,1501, &
                          1529,1573,1616,1644,1667,1688,1783,1819,1844,1993, &
                          2051,2134,2161 /)
      extfrc_lst(: 2) = (/ 'NO2             ','NO              ' /)
      frc_from_dataset(: 2) = (/ .true., .false. /)
      inv_lst(: 2) = (/ 'M               ', 'N2              ' /)
      if( allocated( rxt_tag_lst ) ) then
         deallocate( rxt_tag_lst )
      end if
      allocate( rxt_tag_lst(rxt_tag_cnt),stat=ios )
      if( ios /= 0 ) then
         write(iulog,*) 'set_sim_dat: failed to allocate rxt_tag_lst; error = ',ios
         call endrun
      end if
      if( allocated( rxt_tag_map ) ) then
         deallocate( rxt_tag_map )
      end if
      allocate( rxt_tag_map(rxt_tag_cnt),stat=ios )
      if( ios /= 0 ) then
         write(iulog,*) 'set_sim_dat: failed to allocate rxt_tag_map; error = ',ios
         call endrun
      end if
      rxt_tag_lst(:rxt_tag_cnt) = (/ 'jh2o_b          ', 'jh2o_c          ', 'jh2o_a          ', 'jh2o2           ', &
                                     'jo2_b           ', 'jo2_a           ', 'jo3_a           ', 'jo3_b           ', &
                                     'jhno3           ', 'jho2no2_a       ', 'jho2no2_b       ', 'jn2o            ', &
                                     'jn2o5_a         ', 'jn2o5_b         ', 'jno             ', 'jno_i           ', &
                                     'jno2            ', 'jno3_a          ', 'jno3_b          ', 'jalknit         ', &
                                     'jalkooh         ', 'jbenzooh        ', 'jbepomuc        ', 'jbigald         ', &
                                     'jbigald1        ', 'jbigald2        ', 'jbigald3        ', 'jbigald4        ', &
                                     'jbzooh          ', 'jc2h5ooh        ', 'jc3h7ooh        ', 'jc6h5ooh        ', &
                                     'jch2o_b         ', 'jch2o_a         ', 'jch3cho         ', 'jacet           ', &
                                     'jmgly           ', 'jch3co3h        ', 'jch3ooh         ', 'jch4_a          ', &
                                     'jch4_b          ', 'jco2            ', 'jeooh           ', 'jglyald         ', &
                                     'jglyoxal        ', 'jhonitr         ', 'jhpald          ', 'jhyac           ', &
                                     'jisopnooh       ', 'jisopooh        ', 'jmacr_b         ', 'jmacr_a         ', &
                                     'jmek            ', 'jmekooh         ', 'jmpan           ', 'jmvk            ', &
                                     'jnc4cho         ', 'jnoa            ', 'jnterpooh       ', 'jonitr          ', &
                                     'jpan            ', 'jphenooh        ', 'jpooh           ', 'jrooh           ', &
                                     'jtepomuc        ', 'jterp2ooh       ', 'jterpnit        ', 'jterpooh        ', &
                                     'jterprd1        ', 'jterprd2        ', 'jtolooh         ', 'jxooh           ', &
                                     'jxylenooh       ', 'jxylolooh       ', 'jbrcl           ', 'jbro            ', &
                                     'jbrono2_b       ', 'jbrono2_a       ', 'jccl4           ', 'jcf2clbr        ', &
                                     'jcf3br          ', 'jcfcl3          ', 'jcfc113         ', 'jcfc114         ', &
                                     'jcfc115         ', 'jcf2cl2         ', 'jch2br2         ', 'jch3br          ', &
                                     'jch3ccl3        ', 'jch3cl          ', 'jchbr3          ', 'jcl2            ', &
                                     'jcl2o2          ', 'jclo            ', 'jclono2_b       ', 'jclono2_a       ', &
                                     'jcof2           ', 'jcofcl          ', 'jh1202          ', 'jh2402          ', &
                                     'jhbr            ', 'jhcfc141b       ', 'jhcfc142b       ', 'jhcfc22         ', &
                                     'jhcl            ', 'jhf             ', 'jhobr           ', 'jhocl           ', &
                                     'joclo           ', 'jeuv_26         ', 'jeuv_4          ', 'jeuv_13         ', &
                                     'jeuv_11         ', 'jeuv_6          ', 'jeuv_10         ', 'jeuv_22         ', &
                                     'jeuv_23         ', 'jeuv_25         ', 'jeuv_18         ', 'jeuv_2          ', &
                                     'jeuv_1          ', 'jeuv_16         ', 'jeuv_15         ', 'jeuv_14         ', &
                                     'jeuv_3          ', 'jeuv_17         ', 'jeuv_9          ', 'jeuv_8          ', &
                                     'jeuv_7          ', 'jeuv_5          ', 'jeuv_19         ', 'jeuv_20         ', &
                                     'jeuv_21         ', 'jeuv_24         ', 'jeuv_12         ', 'jh2so4          ', &
                                     'jocs            ', 'jso             ', 'jso2            ', 'jso3            ', &
                                     'jo3s_b          ', 'jo3s_a          ', 'jsoa1_a1        ', 'jsoa1_a2        ', &
                                     'jsoa2_a1        ', 'jsoa2_a2        ', 'jsoa3_a1        ', 'jsoa3_a2        ', &
                                     'jsoa4_a1        ', 'jsoa4_a2        ', 'jsoa5_a1        ', 'jsoa5_a2        ', &
                                     'ag1             ', 'ag2             ', 'O1D_CH4a        ', 'O1D_CH4b        ', &
                                     'O1D_CH4c        ', 'O1D_H2          ', 'O1D_H2O         ', 'O1D_N2          ', &
                                     'O1D_O2          ', 'O1D_O2b         ', 'O1D_O3          ', 'O2_1D_N2        ', &
                                     'O2_1D_O         ', 'O2_1D_O2        ', 'O2_1S_CO2       ', 'O2_1S_N2        ', &
                                     'O2_1S_O         ', 'O2_1S_O2        ', 'O2_1S_O3        ', 'O_O3            ', &
                                     'usr_O_O         ', 'usr_O_O2        ', 'H2_O            ', 'H2O2_O          ', &
                                     'H_HO2           ', 'H_HO2a          ', 'H_HO2b          ', 'H_O2            ', &
                                     'HO2_O           ', 'HO2_O3          ', 'H_O3            ', 'OH_H2           ', &
                                     'OH_H2O2         ', 'OH_HO2          ', 'OH_O            ', 'OH_O3           ', &
                                     'OH_OH           ', 'OH_OH_M         ', 'usr_HO2_HO2     ', 'HO2NO2_OH       ', &
                                     'N2D_O           ', 'N2D_O2          ', 'N_NO            ', 'N_NO2a          ', &
                                     'N_NO2b          ', 'N_NO2c          ', 'N_O2            ', 'NO2_O           ', &
                                     'NO2_O3          ', 'NO2_O_M         ', 'NO3_HO2         ', 'NO3_NO          ', &
                                     'NO3_O           ', 'NO3_OH          ', 'N_OH            ', 'NO_HO2          ', &
                                     'NO_O3           ', 'NO_O_M          ', 'O1D_N2Oa        ', 'O1D_N2Ob        ', &
                                     'tag_NO2_HO2     ', 'tag_NO2_NO3     ', 'tag_NO2_OH      ', 'usr_HNO3_OH     ', &
                                     'usr_HO2NO2_M    ', 'usr_N2O5_M      ', 'CL_CH2O         ', 'CL_CH4          ', &
                                     'CL_H2           ', 'CL_H2O2         ', 'CL_HO2a         ', 'CL_HO2b         ', &
                                     'CL_O3           ', 'CLO_CH3O2       ', 'CLO_CLOa        ', 'CLO_CLOb        ', &
                                     'CLO_CLOc        ', 'CLO_HO2         ', 'CLO_NO          ', 'CLONO2_CL       ', &
                                     'CLO_NO2_M       ', 'CLONO2_O        ', 'CLONO2_OH       ', 'CLO_O           ', &
                                     'CLO_OHa         ', 'CLO_OHb         ', 'HCL_O           ', 'HCL_OH          ', &
                                     'HOCL_CL         ', 'HOCL_O          ', 'HOCL_OH         ', 'O1D_CCL4        ', &
                                     'O1D_CF2CLBR     ', 'O1D_CFC11       ', 'O1D_CFC113      ', 'O1D_CFC114      ', &
                                     'O1D_CFC115      ', 'O1D_CFC12       ', 'O1D_HCLa        ', 'O1D_HCLb        ', &
                                     'tag_CLO_CLO_M   ', 'usr_CL2O2_M     ', 'BR_CH2O         ', 'BR_HO2          ', &
                                     'BR_O3           ', 'BRO_BRO         ', 'BRO_CLOa        ', 'BRO_CLOb        ', &
                                     'BRO_CLOc        ', 'BRO_HO2         ', 'BRO_NO          ', 'BRO_NO2_M       ', &
                                     'BRONO2_O        ', 'BRO_O           ', 'BRO_OH          ', 'HBR_O           ', &
                                     'HBR_OH          ', 'HOBR_O          ', 'O1D_CF3BR       ', 'O1D_CHBR3       ', &
                                     'O1D_H1202       ', 'O1D_H2402       ', 'O1D_HBRa        ', 'O1D_HBRb        ', &
                                     'F_CH4           ', 'F_H2            ', 'F_H2O           ', 'F_HNO3          ', &
                                     'O1D_COF2        ', 'O1D_COFCL       ', 'CH2BR2_CL       ', 'CH2BR2_OH       ', &
                                     'CH3BR_CL        ', 'CH3BR_OH        ', 'CH3CCL3_OH      ', 'CH3CL_CL        ', &
                                     'CH3CL_OH        ', 'CHBR3_CL        ', 'CHBR3_OH        ', 'HCFC141B_OH     ', &
                                     'HCFC142B_OH     ', 'HCFC22_OH       ', 'O1D_CH2BR2      ', 'O1D_CH3BR       ', &
                                     'O1D_HCFC141B    ', 'O1D_HCFC142B    ', 'O1D_HCFC22      ', 'CH2O_HO2        ', &
                                     'CH2O_NO3        ', 'CH2O_O          ', 'CH2O_OH         ', 'CH3O2_CH3O2a    ', &
                                     'CH3O2_CH3O2b    ', 'CH3O2_HO2       ', 'CH3O2_NO        ', 'CH3OH_OH        ', &
                                     'CH3OOH_OH       ', 'CH4_OH          ', 'CO_OH_M         ', 'HCN_OH          ', &
                                     'HCOOH_OH        ', 'HOCH2OO_HO2     ', 'HOCH2OO_M       ', 'HOCH2OO_NO      ', &
                                     'O1D_HCN         ', 'usr_CO_OH_b     ', 'C2H2_CL_M       ', 'C2H2_OH_M       ', &
                                     'C2H4_CL_M       ', 'C2H4_O3         ', 'C2H5O2_C2H5O2   ', 'C2H5O2_CH3O2    ', &
                                     'C2H5O2_HO2      ', 'C2H5O2_NO       ', 'C2H5OH_OH       ', 'C2H5OOH_OH      ', &
                                     'C2H6_CL         ', 'C2H6_OH         ', 'CH3CHO_NO3      ', 'CH3CHO_OH       ', &
                                     'CH3CN_OH        ', 'CH3CO3_CH3CO3   ', 'CH3CO3_CH3O2    ', 'CH3CO3_HO2      ', &
                                     'CH3CO3_NO       ', 'CH3COOH_OH      ', 'CH3COOOH_OH     ', 'EO2_HO2         ', &
                                     'EO2_NO          ', 'EO_M            ', 'EO_O2           ', 'GLYALD_OH       ', &
                                     'GLYOXAL_OH      ', 'PAN_OH          ', 'tag_C2H4_OH     ', 'tag_CH3CO3_NO2  ', &
                                     'usr_PAN_M       ', 'C3H6_NO3        ', 'C3H6_O3         ', 'C3H7O2_CH3O2    ', &
                                     'C3H7O2_HO2      ', 'C3H7O2_NO       ', 'C3H7OOH_OH      ', 'C3H8_OH         ', &
                                     'CH3COCHO_NO3    ', 'CH3COCHO_OH     ', 'HYAC_OH         ', 'NOA_OH          ', &
                                     'PO2_HO2         ', 'PO2_NO          ', 'POOH_OH         ', 'RO2_CH3O2       ', &
                                     'RO2_HO2         ', 'RO2_NO          ', 'ROOH_OH         ', 'tag_C3H6_OH     ', &
                                     'usr_CH3COCH3_OH ', 'BIGENE_NO3      ', 'BIGENE_OH       ', 'ENEO2_NO        ', &
                                     'ENEO2_NOb       ', 'HONITR_OH       ', 'MACRO2_CH3CO3   ', 'MACRO2_CH3O2    ', &
                                     'MACRO2_HO2      ', 'MACRO2_NO3      ', 'MACRO2_NOa      ', 'MACRO2_NOb      ', &
                                     'MACR_O3         ', 'MACR_OH         ', 'MACROOH_OH      ', 'MCO3_CH3CO3     ', &
                                     'MCO3_CH3O2      ', 'MCO3_HO2        ', 'MCO3_MCO3       ', 'MCO3_NO         ', &
                                     'MCO3_NO3        ', 'MEKO2_HO2       ', 'MEKO2_NO        ', 'MEK_OH          ', &
                                     'MEKOOH_OH       ', 'MPAN_OH_M       ', 'MVK_O3          ', 'MVK_OH          ', &
                                     'usr_MCO3_NO2    ', 'usr_MPAN_M      ', 'ALKNIT_OH       ', 'ALKO2_HO2       ', &
                                     'ALKO2_NO        ', 'ALKO2_NOb       ', 'ALKOOH_OH       ', 'BIGALK_OH       ', &
                                     'HPALD_OH        ', 'HYDRALD_OH      ', 'IEPOX_OH        ', 'ISOPAO2_CH3CO3  ', &
                                     'ISOPAO2_CH3O2   ', 'ISOPAO2_HO2     ', 'ISOPAO2_NO      ', 'ISOPAO2_NO3     ', &
                                     'ISOPBO2_CH3CO3  ', 'ISOPBO2_CH3O2   ', 'ISOPBO2_HO2     ', 'ISOPBO2_M       ', &
                                     'ISOPBO2_NO      ', 'ISOPBO2_NO3     ', 'ISOPNITA_OH     ', 'ISOPNITB_OH     ', &
                                     'ISOP_NO3        ', 'ISOPNO3_CH3CO3  ', 'ISOPNO3_CH3O2   ', 'ISOPNO3_HO2     ', &
                                     'ISOPNO3_NO      ', 'ISOPNO3_NO3     ', 'ISOPNOOH_OH     ', 'ISOP_O3         ', &
                                     'ISOP_OH         ', 'ISOPOOH_OH      ', 'NC4CH2OH_OH     ', 'NC4CHO_OH       ', &
                                     'usr_XOOH_OH     ', 'XO2_CH3CO3      ', 'XO2_CH3O2       ', 'XO2_HO2         ', &
                                     'XO2_NO          ', 'XO2_NO3         ', 'XOOH_OHa        ', 'ACBZO2_HO2      ', &
                                     'ACBZO2_NO       ', 'BENZENE_OH      ', 'BENZO2_HO2      ', 'BENZO2_NO       ', &
                                     'BENZOOH_OH      ', 'BZALD_OH        ', 'BZOO_HO2        ', 'BZOOH_OH        ', &
                                     'BZOO_NO         ', 'C6H5O2_HO2      ', 'C6H5O2_NO       ', 'C6H5OOH_OH      ', &
                                     'CRESOL_OH       ', 'DICARBO2_HO2    ', 'DICARBO2_NO     ', 'DICARBO2_NO2    ', &
                                     'MALO2_HO2       ', 'MALO2_NO        ', 'MALO2_NO2       ', 'MDIALO2_HO2     ', &
                                     'MDIALO2_NO      ', 'MDIALO2_NO2     ', 'PHENO2_HO2      ', 'PHENO2_NO       ', &
                                     'PHENOL_OH       ', 'PHENO_NO2       ', 'PHENO_O3        ', 'PHENOOH_OH      ', &
                                     'tag_ACBZO2_NO2  ', 'TOLO2_HO2       ', 'TOLO2_NO        ', 'TOLOOH_OH       ', &
                                     'TOLUENE_OH      ', 'usr_PBZNIT_M    ', 'XYLENES_OH      ', 'XYLENO2_HO2     ', &
                                     'XYLENO2_NO      ', 'XYLENOOH_OH     ', 'XYLOLO2_HO2     ', 'XYLOLO2_NO      ', &
                                     'XYLOL_OH        ', 'XYLOLOOH_OH     ', 'BCARY_NO3       ', 'BCARY_O3        ', &
                                     'BCARY_OH        ', 'MTERP_NO3       ', 'MTERP_O3        ', 'MTERP_OH        ', &
                                     'NTERPO2_CH3O2   ', 'NTERPO2_HO2     ', 'NTERPO2_NO      ', 'NTERPO2_NO3     ', &
                                     'NTERPOOH_OH     ', 'TERP2O2_CH3O2   ', 'TERP2O2_HO2     ', 'TERP2O2_NO      ', &
                                     'TERP2OOH_OH     ', 'TERPNIT_OH      ', 'TERPO2_CH3O2    ', 'TERPO2_HO2      ', &
                                     'TERPO2_NO       ', 'TERPOOH_OH      ', 'TERPROD1_NO3    ', 'TERPROD1_OH     ', &
                                     'TERPROD2_OH     ', 'OCS_O           ', 'OCS_OH          ', 'S_O2            ', &
                                     'S_O3            ', 'SO_BRO          ', 'SO_CLO          ', 'S_OH            ', &
                                     'SO_NO2          ', 'SO_O2           ', 'SO_O3           ', 'SO_OCLO         ', &
                                     'SO_OH           ', 'usr_SO2_OH      ', 'usr_SO3_H2O     ', 'DMS_NO3         ', &
                                     'DMS_OHa         ', 'NH3_OH          ', 'usr_DMS_OH      ', 'usr_GLYOXAL_aer ', &
                                     'usr_HO2_aer     ', 'usr_N2O5_aer    ', 'usr_NH4NO3_strat', 'usr_NH4_strat_ta', &
                                     'usr_NO2_aer     ', 'usr_NO3_aer     ', 'IVOC_OH         ', 'SVOC_OH         ', &
                                     'het1            ', 'het10           ', 'het11           ', 'het12           ', &
                                     'het13           ', 'het14           ', 'het15           ', 'het16           ', &
                                     'het17           ', 'het2            ', 'het3            ', 'het4            ', &
                                     'het5            ', 'het6            ', 'het7            ', 'het8            ', &
                                     'het9            ', 'elec1           ', 'elec2           ', 'elec3           ', &
                                     'ion_N2p_O2      ', 'ion_N2p_Oa      ', 'ion_N2p_Ob      ', 'ion_Np_O        ', &
                                     'ion_Np_O2a      ', 'ion_Np_O2b      ', 'ion_O2p_N       ', 'ion_O2p_N2      ', &
                                     'ion_O2p_NO      ', 'ion_Op_CO2      ', 'ion_Op_N2       ', 'ion_Op_O2       ', &
                                     'BCARY_O3S       ', 'C2H4_O3S        ', 'C3H6_O3S        ', 'HO2_O3S         ', &
                                     'H_O3S           ', 'ISOP_O3S        ', 'MACR_O3S        ', 'MTERP_O3S       ', &
                                     'MVK_O3S         ', 'NO2_O3S         ', 'NO_O3S          ', 'O1D_O3S         ', &
                                     'OH_O3S          ', 'O_O3S           ', 'PHENO_O3S       ' /)
      rxt_tag_map(:rxt_tag_cnt) = (/ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, &
                                       11, 12, 13, 14, 15, 16, 17, 18, 19, 20, &
                                       21, 22, 23, 24, 25, 26, 27, 28, 29, 30, &
                                       31, 32, 33, 34, 35, 36, 37, 38, 39, 40, &
                                       41, 42, 43, 44, 45, 46, 47, 48, 49, 50, &
                                       51, 52, 53, 54, 55, 56, 57, 58, 59, 60, &
                                       61, 62, 63, 64, 65, 66, 67, 68, 69, 70, &
                                       71, 72, 73, 74, 75, 76, 77, 78, 79, 80, &
                                       81, 82, 83, 84, 85, 86, 87, 88, 89, 90, &
                                       91, 92, 93, 94, 95, 96, 97, 98, 99, 100, &
                                      101, 102, 103, 104, 105, 106, 107, 108, 109, 110, &
                                      111, 112, 113, 114, 115, 116, 117, 118, 119, 120, &
                                      121, 122, 123, 124, 125, 126, 127, 128, 129, 130, &
                                      131, 132, 133, 134, 135, 136, 137, 138, 139, 140, &
                                      141, 142, 143, 144, 145, 146, 147, 148, 149, 150, &
                                      151, 152, 153, 154, 155, 156, 157, 158, 159, 160, &
                                      161, 162, 163, 164, 165, 166, 167, 168, 169, 170, &
                                      171, 172, 173, 174, 175, 176, 177, 178, 179, 180, &
                                      181, 182, 183, 184, 185, 186, 187, 188, 189, 190, &
                                      191, 192, 193, 194, 195, 196, 197, 198, 199, 200, &
                                      201, 202, 203, 204, 205, 206, 207, 208, 209, 210, &
                                      211, 212, 213, 214, 215, 216, 217, 218, 219, 220, &
                                      221, 222, 223, 224, 225, 226, 227, 228, 229, 230, &
                                      231, 232, 233, 234, 235, 236, 237, 238, 239, 240, &
                                      241, 242, 243, 244, 245, 246, 247, 248, 249, 250, &
                                      251, 252, 253, 254, 255, 256, 257, 258, 259, 260, &
                                      261, 262, 263, 264, 265, 266, 267, 268, 269, 270, &
                                      271, 272, 273, 274, 275, 276, 277, 278, 279, 280, &
                                      281, 282, 283, 284, 285, 286, 287, 288, 289, 290, &
                                      291, 292, 293, 294, 295, 296, 297, 298, 299, 300, &
                                      301, 302, 303, 304, 305, 306, 307, 308, 309, 310, &
                                      311, 312, 313, 314, 315, 316, 317, 318, 319, 320, &
                                      321, 322, 323, 324, 325, 326, 327, 328, 329, 330, &
                                      331, 332, 333, 334, 335, 336, 337, 338, 339, 340, &
                                      341, 342, 343, 344, 345, 346, 347, 348, 349, 350, &
                                      351, 352, 353, 354, 355, 356, 357, 358, 359, 360, &
                                      361, 362, 363, 364, 365, 366, 367, 368, 369, 370, &
                                      371, 372, 373, 374, 375, 376, 377, 378, 379, 380, &
                                      381, 382, 383, 384, 385, 386, 387, 388, 389, 390, &
                                      391, 392, 393, 394, 395, 396, 397, 398, 399, 400, &
                                      401, 402, 403, 404, 405, 406, 407, 408, 409, 410, &
                                      411, 412, 413, 414, 415, 416, 417, 418, 419, 420, &
                                      421, 422, 423, 424, 425, 426, 427, 428, 429, 430, &
                                      431, 432, 433, 434, 435, 436, 437, 438, 439, 440, &
                                      441, 442, 443, 444, 445, 446, 447, 448, 449, 450, &
                                      451, 452, 453, 454, 455, 456, 457, 458, 459, 460, &
                                      461, 462, 463, 464, 465, 466, 467, 468, 469, 470, &
                                      471, 472, 473, 474, 475, 476, 477, 478, 479, 480, &
                                      481, 482, 483, 484, 485, 486, 487, 488, 489, 490, &
                                      491, 492, 493, 494, 495, 496, 497, 498, 499, 500, &
                                      501, 502, 503, 504, 505, 506, 507, 508, 509, 510, &
                                      511, 512, 513, 514, 515, 516, 517, 518, 519, 520, &
                                      521, 522, 523, 524, 525, 526, 527, 528, 529, 530, &
                                      531, 532, 533, 534, 535, 536, 537, 538, 539, 540, &
                                      541, 542, 543, 544, 545, 546, 547, 548, 549, 550, &
                                      551, 552, 553, 554, 555, 556, 557, 558, 559, 560, &
                                      561, 562, 563, 564, 565, 566, 567, 568, 569, 570, &
                                      571, 572, 573, 574, 575, 576, 577, 578, 579 /)
      if( allocated( pht_alias_lst ) ) then
         deallocate( pht_alias_lst )
      end if
      allocate( pht_alias_lst(phtcnt,2),stat=ios )
      if( ios /= 0 ) then
         write(iulog,*) 'set_sim_dat: failed to allocate pht_alias_lst; error = ',ios
         call endrun
      end if
      if( allocated( pht_alias_mult ) ) then
         deallocate( pht_alias_mult )
      end if
      allocate( pht_alias_mult(phtcnt,2),stat=ios )
      if( ios /= 0 ) then
         write(iulog,*) 'set_sim_dat: failed to allocate pht_alias_mult; error = ',ios
         call endrun
      end if
      pht_alias_lst(:,1) = (/ '                ', '                ', '                ', '                ', &
                              'userdefined     ', 'userdefined     ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', 'userdefined     ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ' /)
      pht_alias_lst(:,2) = (/ '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', 'jch3ooh         ', &
                              'jch3ooh         ', 'jch3ooh         ', 'jno2            ', 'jno2            ', &
                              'jno2            ', 'jno2            ', 'jno2            ', 'jno2            ', &
                              'jch3ooh         ', 'jch3ooh         ', 'jch3ooh         ', 'jch3ooh         ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', 'jh2o2           ', '                ', '                ', &
                              '                ', '                ', 'jch3ooh         ', '                ', &
                              'jmgly           ', 'jch2o_a         ', 'jno2            ', '                ', &
                              'jch3ooh         ', 'jch3ooh         ', '                ', '                ', &
                              'jacet           ', 'jch3ooh         ', 'jpan            ', '                ', &
                              'jch2o_a         ', 'jch2o_a         ', 'jch3ooh         ', 'jch3cho         ', &
                              '                ', 'jch3ooh         ', 'jch3ooh         ', 'jch3ooh         ', &
                              'jno2            ', 'jch3ooh         ', 'jch3ooh         ', 'jch3ooh         ', &
                              'jch3cho         ', 'jch3cho         ', 'jch3ooh         ', 'jch3ooh         ', &
                              'jch3ooh         ', 'jch3ooh         ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              'jo3_b           ', 'jo3_a           ', 'jno2            ', 'jno2            ', &
                              'jno2            ', 'jno2            ', 'jno2            ', 'jno2            ', &
                              'jno2            ', 'jno2            ', 'jno2            ', 'jno2            ' /)
      pht_alias_mult(:,1) = (/ 1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8 /)
      pht_alias_mult(:,2) = (/ 1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, .10_r8, 0.2_r8, .14_r8, &
                          .20_r8, .20_r8, .006_r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 0.28_r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, .006_r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, .10_r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
                          1._r8, 1._r8, .0004_r8, .0004_r8, .0004_r8, &
                          .0004_r8, .0004_r8, .0004_r8, .0004_r8, .0004_r8, &
                          .0004_r8, .0004_r8 /)
      allocate( cph_enthalpy(enthalpy_cnt),stat=ios )
      if( ios /= 0 ) then
         write(iulog,*) 'set_sim_dat: failed to allocate cph_enthalpy; error = ',ios
         call endrun
      end if
      allocate( cph_rid(enthalpy_cnt),stat=ios )
      if( ios /= 0 ) then
         write(iulog,*) 'set_sim_dat: failed to allocate cph_rid; error = ',ios
         call endrun
      end if
      cph_rid(:) = (/ 160, 161, 162, 164, 165, &
                                       166, 168, 169, 170, 171, &
                                       172, 173, 174, 177, 180, &
                                       181, 182, 183, 186, 187, &
                                       188, 191, 193, 194, 195, &
                                       199, 200, 208, 209, 550, &
                                       551, 552, 553, 554, 556, &
                                       557, 558, 559, 561, 563, &
                                       564 /)
      cph_enthalpy(:) = (/ 189.810000_r8, 32.910000_r8, 189.810000_r8, 94.300000_r8, 94.300000_r8, &
                              94.300000_r8, 62.600000_r8, 62.600000_r8, 62.600000_r8, 62.600000_r8, &
                             392.190000_r8, 493.580000_r8, 101.390000_r8, 232.590000_r8, 203.400000_r8, &
                             226.580000_r8, 120.100000_r8, 194.710000_r8, 293.620000_r8, 67.670000_r8, &
                             165.300000_r8, 165.510000_r8, 229.610000_r8, 177.510000_r8, 313.750000_r8, &
                             133.750000_r8, 193.020000_r8, 34.470000_r8, 199.170000_r8, 82.389000_r8, &
                             508.950000_r8, 354.830000_r8, 339.590000_r8, 67.530000_r8, 95.550000_r8, &
                             239.840000_r8, 646.280000_r8, 406.160000_r8, 271.380000_r8, 105.040000_r8, &
                             150.110000_r8 /)
      end subroutine set_sim_dat
      end module mo_sim_dat
module mo_imp_sol
  use shr_kind_mod, only : r8 => shr_kind_r8
  use chem_mods, only : clscnt4, gas_pcnst, clsmap
  use cam_logfile, only : iulog
  implicit none
  private
  public :: imp_slv_inti, imp_sol
  save
  real(r8), parameter :: rel_err = 1.e-3_r8
  real(r8), parameter :: high_rel_err = 1.e-4_r8
  !-----------------------------------------------------------------------
  ! Newton-Raphson iteration limits
  !-----------------------------------------------------------------------
  integer, parameter :: itermax = 11
  integer, parameter :: cut_limit = 5
  real(r8), parameter :: small = 1.e-40_r8
  real(r8) :: epsilon(clscnt4)
  logical :: factor(itermax)
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
    integer :: m, ox_ndx, o3a_ndx
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
    ! ... imp_sol advances the volumetric mixing ratio
    ! forward one time step via the fully implicit euler scheme.
    ! this source is meant for small l1 cache machines such as
    ! the intel pentium and itanium cpus
    !-----------------------------------------------------------------------
    use chem_mods, only : rxntot, extcnt, nzcnt, permute, cls_rxt_cnt
    use mo_tracname, only : solsym
    use mo_lin_matrix, only : linmat
    use mo_nln_matrix, only : nlnmat
    use mo_lu_factor, only : lu_fac
    use mo_lu_solve, only : lu_slv
    use mo_prod_loss, only : imp_prod_loss
    use mo_indprd, only : indprd
    use time_manager, only : get_nstep
    use perf_mod, only : t_startf, t_stopf
    implicit none
    !-----------------------------------------------------------------------
    ! ... dummy args
    !-----------------------------------------------------------------------
    integer, intent(in) :: ncol ! columns in chunck
    integer, intent(in) :: nlev
    integer, intent(in) :: lchnk ! chunk id
    real(r8), intent(in) :: delt ! time step (s)
    real(r8), intent(in) :: reaction_rates(ncol,nlev,max(1,rxntot)) ! rxt rates (1/cm^3/s)
    real(r8), intent(in) :: extfrc(ncol,nlev,max(1,extcnt)) ! external in-situ forcing (1/cm^3/s)
    real(r8), intent(in) :: het_rates(ncol,nlev,max(1,gas_pcnst)) ! washout rates (1/s)
    real(r8), intent(inout) :: base_sol(ncol,nlev,gas_pcnst) ! species mixing ratios (vmr)
    real(r8), intent(out) :: prod_out(ncol,nlev,max(1,clscnt4))
    real(r8), intent(out) :: loss_out(ncol,nlev,max(1,clscnt4))
    !-----------------------------------------------------------------------
    ! ... local variables
    !-----------------------------------------------------------------------
    integer :: nr_iter, &
         lev, &
         i, &
         j, &
         k, l, &
         m
    integer :: fail_cnt, cut_cnt, stp_con_cnt
    integer :: nstep
    real(r8) :: interval_done, dt, dti
    real(r8) :: max_delta(max(1,clscnt4))
    real(r8) :: sys_jac(max(1,nzcnt))
    real(r8) :: lin_jac(max(1,nzcnt))
    real(r8), dimension(max(1,clscnt4)) :: &
         solution, &
         forcing, &
         iter_invariant, &
         prod, &
         loss
    real(r8) :: lrxt(max(1,rxntot))
    real(r8) :: lsol(max(1,gas_pcnst))
    real(r8) :: lhet(max(1,gas_pcnst))
    real(r8), dimension(ncol,nlev,max(1,clscnt4)) :: &
         ind_prd
    logical :: convergence
    logical :: frc_mask, iter_conv
    logical :: converged(max(1,clscnt4))
    solution(:) = 0._r8
    !-----------------------------------------------------------------------
    ! ... class independent forcing
    !-----------------------------------------------------------------------
    if( cls_rxt_cnt(1,4) > 0 .or. extcnt > 0 ) then
       call indprd( 4, ind_prd, clscnt4, base_sol, extfrc, &
            reaction_rates, ncol )
    else
       do m = 1,max(1,clscnt4)
          ind_prd(:,:,m) = 0._r8
       end do
    end if
    level_loop : do lev = 1,nlev
       column_loop : do i = 1,ncol
          !-----------------------------------------------------------------------
          ! ... transfer from base to local work arrays
          !-----------------------------------------------------------------------
          do m = 1,rxntot
             lrxt(m) = reaction_rates(i,lev,m)
          end do
          if( gas_pcnst > 0 ) then
             do m = 1,gas_pcnst
                lhet(m) = het_rates(i,lev,m)
             end do
          end if
          !-----------------------------------------------------------------------
          ! ... time step loop
          !-----------------------------------------------------------------------
          dt = delt
          cut_cnt = 0
          fail_cnt = 0
          stp_con_cnt = 0
          interval_done = 0._r8
          time_step_loop : do
             dti = 1._r8 / dt
             !-----------------------------------------------------------------------
             ! ... transfer from base to local work arrays
             !-----------------------------------------------------------------------
             do m = 1,gas_pcnst
                lsol(m) = base_sol(i,lev,m)
             end do
             !-----------------------------------------------------------------------
             ! ... transfer from base to class array
             !-----------------------------------------------------------------------
             do k = 1,clscnt4
                j = clsmap(k,4)
                m = permute(k,4)
                solution(m) = lsol(j)
             end do
             !-----------------------------------------------------------------------
             ! ... set the iteration invariant part of the function f(y)
             !-----------------------------------------------------------------------
             if( cls_rxt_cnt(1,4) > 0 .or. extcnt > 0 ) then
                do m = 1,clscnt4
                   iter_invariant(m) = dti * solution(m) + ind_prd(i,lev,m)
                end do
             else
                do m = 1,clscnt4
                   iter_invariant(m) = dti * solution(m)
                end do
             end if
             !-----------------------------------------------------------------------
             ! ... the linear component
             !-----------------------------------------------------------------------
             if( cls_rxt_cnt(2,4) > 0 ) then
                call t_startf( 'lin_mat' )
                call linmat( lin_jac, lsol, lrxt, lhet )
                call t_stopf( 'lin_mat' )
             end if
             !=======================================================================
             ! the newton-raphson iteration for f(y) = 0
             !=======================================================================
             iter_loop : do nr_iter = 1,itermax
                !-----------------------------------------------------------------------
                ! ... the non-linear component
                !-----------------------------------------------------------------------
                if( factor(nr_iter) ) then
                   call t_startf( 'nln_mat' )
                   call nlnmat( sys_jac, lsol, lrxt, lin_jac, dti )
                   call t_stopf( 'nln_mat' )
                   !-----------------------------------------------------------------------
                   ! ... factor the "system" matrix
                   !-----------------------------------------------------------------------
                   call t_startf( 'lu_fac' )
                   call lu_fac( sys_jac )
                   call t_stopf( 'lu_fac' )
                end if
                !-----------------------------------------------------------------------
                ! ... form f(y)
                !-----------------------------------------------------------------------
                call t_startf( 'prod_loss' )
                call imp_prod_loss( prod, loss, lsol, lrxt, lhet )
                call t_stopf( 'prod_loss' )
                do m = 1,clscnt4
                   forcing(m) = solution(m)*dti - (iter_invariant(m) + prod(m) - loss(m))
                end do
                !-----------------------------------------------------------------------
                ! ... solve for the mixing ratio at t(n+1)
                !-----------------------------------------------------------------------
                call t_startf( 'lu_slv' )
                call lu_slv( sys_jac, forcing )
                call t_stopf( 'lu_slv' )
                do m = 1,clscnt4
                   solution(m) = solution(m) + forcing(m)
                end do
                !-----------------------------------------------------------------------
                ! ... convergence measures
                !-----------------------------------------------------------------------
                if( nr_iter > 1 ) then
                   do k = 1,clscnt4
                      m = permute(k,4)
                      if( abs(solution(m)) > 1.e-20_r8 ) then
                         max_delta(k) = abs( forcing(m)/solution(m) )
                      else
                         max_delta(k) = 0._r8
                      end if
                   end do
                end if
                !-----------------------------------------------------------------------
                ! ... limit iterate
                !-----------------------------------------------------------------------
                where( solution(:) < 0._r8 )
                   solution(:) = 0._r8
                endwhere
                !-----------------------------------------------------------------------
                ! ... transfer latest solution back to work array
                !-----------------------------------------------------------------------
                do k = 1,clscnt4
                   j = clsmap(k,4)
                   m = permute(k,4)
                   lsol(j) = solution(m)
                end do
                !-----------------------------------------------------------------------
                ! ... check for convergence
                !-----------------------------------------------------------------------
                converged(:) = .true.
                if( nr_iter > 1 ) then
                   do k = 1,clscnt4
                      m = permute(k,4)
                      frc_mask = abs( forcing(m) ) > small
                      if( frc_mask ) then
                         converged(k) = abs(forcing(m)) <= epsilon(k)*abs(solution(m))
                      else
                         converged(k) = .true.
                      end if
                   end do
                   convergence = all( converged(:) )
                   if( convergence ) then
                      exit
                   end if
                end if
             end do iter_loop
             !-----------------------------------------------------------------------
             ! ... check for newton-raphson convergence
             !-----------------------------------------------------------------------
             if( .not. convergence ) then
                !-----------------------------------------------------------------------
                ! ... non-convergence
                !-----------------------------------------------------------------------
                fail_cnt = fail_cnt + 1
                nstep = get_nstep()
                write(iulog,'('' imp_sol: Time step '',1p,e21.13,'' failed to converge @ (lchnk,lev,col,nstep) = '',4i6)') &
                     dt,lchnk,lev,i,nstep
                stp_con_cnt = 0
                if( cut_cnt < cut_limit ) then
                   cut_cnt = cut_cnt + 1
                   if( cut_cnt < cut_limit ) then
                      dt = .5_r8 * dt
                   else
                      dt = .1_r8 * dt
                   end if
                   cycle time_step_loop
                else
                   write(iulog,'('' imp_sol: Failed to converge @ (lchnk,lev,col,nstep,dt,time) = '',4i6,1p,2e21.13)') &
                        lchnk,lev,i,nstep,dt,interval_done+dt
                   do m = 1,clscnt4
                      if( .not. converged(m) ) then
                         write(iulog,'(1x,a8,1x,1pe10.3)') solsym(clsmap(m,4)), max_delta(m)
                      end if
                   end do
                end if
             end if
             !-----------------------------------------------------------------------
             ! ... check for interval done
             !-----------------------------------------------------------------------
             interval_done = interval_done + dt
             if( abs( delt - interval_done ) <= .0001_r8 ) then
                if( fail_cnt > 0 ) then
                   write(iulog,*) 'imp_sol : @ (lchnk,lev,col) = ',lchnk,lev,i,' failed ',fail_cnt,' times'
                end if
                exit time_step_loop
             else
                !-----------------------------------------------------------------------
                ! ... transfer latest solution back to base array
                !-----------------------------------------------------------------------
                if( convergence ) then
                   stp_con_cnt = stp_con_cnt + 1
                end if
                do m = 1,gas_pcnst
                   base_sol(i,lev,m) = lsol(m)
                end do
                if( stp_con_cnt >= 2 ) then
                   dt = 2._r8*dt
                   stp_con_cnt = 0
                end if
                dt = min( dt,delt-interval_done )
                ! write(iulog,'('' imp_sol: New time step '',1p,e21.13)') dt
             end if
          end do time_step_loop
          !-----------------------------------------------------------------------
          ! ... Transfer latest solution back to base array
          !-----------------------------------------------------------------------
          cls_loop: do k = 1,clscnt4
             j = clsmap(k,4)
             m = permute(k,4)
             base_sol(i,lev,j) = solution(m)
             ! output diagnostics
             prod_out(i,lev,k) = prod(k) + ind_prd(i,lev,k)
             loss_out(i,lev,k) = loss(k)
          end do cls_loop
       end do column_loop
    end do level_loop
  end subroutine imp_sol
end module mo_imp_sol
module mo_exp_sol
  private
  public :: exp_sol
  public :: exp_sol_inti
contains
  subroutine exp_sol_inti
    use mo_tracname, only : solsym
    use chem_mods, only : clscnt1, clsmap
    use ppgrid, only : pver
    use cam_history, only : addfld
    implicit none
    integer :: i,j
    do i = 1,clscnt1
       j = clsmap(i,1)
       call addfld( trim(solsym(j))//'_CHMP', (/ 'lev' /), 'I', '/cm3/s', 'chemical production rate' )
       call addfld( trim(solsym(j))//'_CHML', (/ 'lev' /), 'I', '/cm3/s', 'chemical loss rate' )
    enddo
  end subroutine exp_sol_inti
  subroutine exp_sol( base_sol, reaction_rates, het_rates, extfrc, delt, xhnm, ncol, lchnk, ltrop )
    !-----------------------------------------------------------------------
    ! ... Exp_sol advances the volumetric mixing ratio
    ! forward one time step via the fully explicit
    ! Euler scheme
    !-----------------------------------------------------------------------
    use chem_mods, only : clscnt1, extcnt, gas_pcnst, clsmap, rxntot
    use ppgrid, only : pcols, pver
    use mo_prod_loss, only : exp_prod_loss
    use mo_indprd, only : indprd
    use shr_kind_mod, only : r8 => shr_kind_r8
    use cam_history, only : outfld
    use mo_tracname, only : solsym
    implicit none
    !-----------------------------------------------------------------------
    ! ... Dummy arguments
    !-----------------------------------------------------------------------
    integer, intent(in) :: ncol ! columns in chunck
    integer, intent(in) :: lchnk ! chunk id
    real(r8), intent(in) :: delt ! time step (s)
    real(r8), intent(in) :: het_rates(ncol,pver,max(1,gas_pcnst)) ! het rates (1/cm^3/s)
    real(r8), intent(in) :: reaction_rates(ncol,pver,rxntot) ! rxt rates (1/cm^3/s)
    real(r8), intent(in) :: extfrc(ncol,pver,extcnt) ! "external insitu forcing" (1/cm^3/s)
    real(r8), intent(in) :: xhnm(ncol,pver)
    integer, intent(in) :: ltrop(pcols) ! chemistry troposphere boundary (index)
    real(r8), intent(inout) :: base_sol(ncol,pver,gas_pcnst) ! working mixing ratios (vmr)
    !-----------------------------------------------------------------------
    ! ... Local variables
    !-----------------------------------------------------------------------
    integer :: i, k, l, m
    real(r8), dimension(ncol,pver,clscnt1) :: &
         prod, &
         loss, &
         ind_prd
    real(r8), dimension(ncol,pver) :: wrk
    !-----------------------------------------------------------------------
    ! ... Put "independent" production in the forcing
    !-----------------------------------------------------------------------
    call indprd( 1, ind_prd, clscnt1, base_sol, extfrc, &
         reaction_rates, ncol )
    !-----------------------------------------------------------------------
    ! ... Form F(y)
    !-----------------------------------------------------------------------
    call exp_prod_loss( prod, loss, base_sol, reaction_rates, het_rates )
    !-----------------------------------------------------------------------
    ! ... Solve for the mixing ratio at t(n+1)
    !-----------------------------------------------------------------------
    do m = 1,clscnt1
       l = clsmap(m,1)
       do i = 1,ncol
          do k = ltrop(i)+1,pver
             base_sol(i,k,l) = base_sol(i,k,l) + delt * (prod(i,k,m) + ind_prd(i,k,m) - loss(i,k,m))
          end do
       end do
       wrk(:,:) = (prod(:,:,m) + ind_prd(:,:,m))*xhnm
       call outfld( trim(solsym(l))//'_CHMP', wrk(:,:), ncol, lchnk )
       wrk(:,:) = (loss(:,:,m))*xhnm
       call outfld( trim(solsym(l))//'_CHML', wrk(:,:), ncol, lchnk )
    end do
  end subroutine exp_sol
end module mo_exp_sol
