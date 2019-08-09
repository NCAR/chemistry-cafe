      module mo_setrxt
      use shr_kind_mod, only : r8 => shr_kind_r8
      private
      public :: setrxt
      public :: setrxt_hrates
      contains
      subroutine setrxt( rate, temp, m, ncol )
      use ppgrid, only : pcols, pver
      use chem_mods, only : rxntot
      use mo_jpl, only : jpl
      implicit none
!-------------------------------------------------------
! ... dummy arguments
!-------------------------------------------------------
      integer, intent(in) :: ncol
      real(r8), intent(in) :: temp(pcols,pver)
      real(r8), intent(in) :: m(ncol*pver)
      real(r8), intent(inout) :: rate(ncol*pver,max(1,rxntot))
!-------------------------------------------------------
! ... local variables
!-------------------------------------------------------
      integer :: n
      integer :: offset
      real(r8) :: itemp(ncol*pver)
      real(r8) :: exp_fac(ncol*pver)
      real(r8) :: ko(ncol*pver)
      real(r8) :: kinf(ncol*pver)
      rate(:,106) = 9.6e-10_r8
      rate(:,107) = 1.3e-09_r8
      rate(:,108) = 2e-29_r8
      rate(:,109) = 1e-27_r8
      rate(:,110) = 1.6e-09_r8
      rate(:,111) = 6e-12_r8
      rate(:,112) = 2.9e-12_r8
      rate(:,113) = 2.9e-11_r8
      rate(:,114) = 2e-10_r8
      rate(:,115) = 4.63e-07_r8
      rate(:,116) = 1e-10_r8
      rate(:,117) = 1e-10_r8
      rate(:,118) = 1e-11_r8
      rate(:,119) = 1.7e-10_r8
      rate(:,120) = 1e-28_r8
      rate(:,121) = 1e-28_r8
      rate(:,122) = 4e-11_r8
      rate(:,123) = 4e-11_r8
      rate(:,124) = 3.5e-12_r8
      rate(:,125) = 3.5e-12_r8
      rate(:,126) = 3.51e-10_r8
      rate(:,127) = 1.1e-10_r8
      rate(:,128) = 6e-15_r8
      rate(:,129) = 1e-10_r8
      rate(:,130) = 1e-10_r8
      rate(:,131) = 2.2e-10_r8
      rate(:,132) = 1.2e-09_r8
      rate(:,133) = 1.4e-10_r8
      rate(:,134) = 1.3e-10_r8
      rate(:,135) = 2.31e-07_r8
      rate(:,141) = 1.5e-06_r8
      rate(:,142) = 2e-09_r8
      rate(:,143) = 1e-09_r8
      rate(:,144) = 3.6e-06_r8
      rate(:,145) = 4e-12_r8
      rate(:,146) = 1e-09_r8
      rate(:,147) = 5e-06_r8
      rate(:,148) = 7e-12_r8
      rate(:,275) = 6e-11_r8
      rate(:,289) = 1e-10_r8
      rate(:,290) = 1e-10_r8
      rate(:,291) = 3e-10_r8
      rate(:,292) = 1.6e-28_r8
      rate(:,293) = 1.4e-09_r8
      rate(:,294) = 1.6e-09_r8
      rate(:,295) = 2e-13_r8
      rate(:,296) = 1.2e-10_r8
      rate(:,297) = 7e-10_r8
      rate(:,298) = 1.6e-28_r8
      rate(:,299) = 1.6e-09_r8
      rate(:,300) = 1.6e-28_r8
      rate(:,301) = 7e-10_r8
      rate(:,302) = 1e-12_r8
      rate(:,303) = 7.6e-10_r8
      rate(:,304) = 1.45e-26_r8
      rate(:,305) = 5e-12_r8
      rate(:,306) = 1e-13_r8
      rate(:,307) = 2e-06_r8
      rate(:,308) = 2e-06_r8
      rate(:,309) = 7e-11_r8
      rate(:,310) = 1.5e-06_r8
      rate(:,311) = 1e-09_r8
      rate(:,312) = 1.5e-06_r8
      rate(:,313) = 7e-12_r8
      rate(:,314) = 5e-10_r8
      rate(:,315) = 1e-10_r8
      rate(:,316) = 1e-09_r8
      rate(:,317) = 1e-09_r8
      rate(:,318) = 1e-12_r8
      rate(:,319) = 4e-10_r8
      rate(:,320) = 2e-10_r8
      rate(:,321) = 1e-10_r8
      rate(:,322) = 1e-10_r8
      rate(:,323) = 9.9e-30_r8
      rate(:,324) = 1.4e-09_r8
      rate(:,325) = 1.6e-09_r8
      rate(:,326) = 2.9e-09_r8
      rate(:,327) = 7e-10_r8
      rate(:,328) = 2e-10_r8
      rate(:,329) = 3.4e-31_r8
      rate(:,330) = 7.8e-10_r8
      rate(:,331) = 1.5e-10_r8
      rate(:,332) = 1.5e-10_r8
      rate(:,333) = 2e-06_r8
      rate(:,334) = 9e-10_r8
      rate(:,335) = 2.4e-10_r8
      rate(:,336) = 2.8e-28_r8
      rate(:,337) = 1e-10_r8
      rate(:,338) = 5e-16_r8
      rate(:,339) = 4.4e-10_r8
      rate(:,340) = 5.5e-10_r8
      rate(:,341) = 8.4e-10_r8
      rate(:,342) = 1e-10_r8
      rate(:,343) = 1e-10_r8
      rate(:,344) = 2.5e-10_r8
      rate(:,345) = 4.3e-10_r8
      rate(:,346) = 4e-10_r8
      rate(:,347) = 1.7e-09_r8
      rate(:,348) = 3e-10_r8
      rate(:,349) = 1.5e-10_r8
      rate(:,351) = 1e-10_r8
      rate(:,352) = 1e-10_r8
      rate(:,353) = 7.6e-28_r8
      rate(:,354) = 1.4e-09_r8
      rate(:,355) = 1e-09_r8
      rate(:,356) = 1.1e-09_r8
      rate(:,357) = 2e-10_r8
      rate(:,358) = 9e-10_r8
      rate(:,360) = 1e-10_r8
      rate(:,361) = 1e-10_r8
      rate(:,362) = 2e-28_r8
      rate(:,363) = 5.8e-10_r8
      rate(:,364) = 3.2e-11_r8
      rate(:,365) = 6e-13_r8
      rate(:,366) = 2e-09_r8
      rate(:,367) = 3.6e-09_r8
      rate(:,368) = 5e-13_r8
      rate(:,369) = 1e-09_r8
      rate(:,370) = 1.9e-10_r8
      rate(:,371) = 3e-10_r8
      rate(:,372) = 2.9e-31_r8
      rate(:,373) = 8e-10_r8
      rate(:,374) = 9e-10_r8
      rate(:,398) = 0.000258_r8
      rate(:,399) = 0.085_r8
      rate(:,400) = 1.2e-10_r8
      rate(:,405) = 1.2e-10_r8
      rate(:,406) = 1e-20_r8
      rate(:,407) = 1.3e-16_r8
      rate(:,409) = 4.2e-13_r8
      rate(:,411) = 8e-14_r8
      rate(:,412) = 3.9e-17_r8
      rate(:,419) = 6.9e-12_r8
      rate(:,420) = 7.2e-11_r8
      rate(:,421) = 1.6e-12_r8
      rate(:,427) = 1.8e-12_r8
      rate(:,431) = 1.8e-12_r8
      rate(:,435) = 7e-13_r8
      rate(:,436) = 5e-12_r8
      rate(:,445) = 3.5e-12_r8
      rate(:,447) = 1e-11_r8
      rate(:,448) = 2.2e-11_r8
      rate(:,449) = 5e-11_r8
      rate(:,484) = 1.7e-13_r8
      rate(:,486) = 2.607e-10_r8
      rate(:,487) = 9.75e-11_r8
      rate(:,488) = 2.07e-10_r8
      rate(:,489) = 2.088e-10_r8
      rate(:,490) = 1.17e-10_r8
      rate(:,491) = 4.644e-11_r8
      rate(:,492) = 1.204e-10_r8
      rate(:,493) = 9.9e-11_r8
      rate(:,494) = 3.3e-12_r8
      rate(:,513) = 4.5e-11_r8
      rate(:,514) = 4.62e-10_r8
      rate(:,515) = 1.2e-10_r8
      rate(:,516) = 9e-11_r8
      rate(:,517) = 3e-11_r8
      rate(:,522) = 2.14e-11_r8
      rate(:,523) = 1.9e-10_r8
      rate(:,536) = 2.57e-10_r8
      rate(:,537) = 1.8e-10_r8
      rate(:,538) = 1.794e-10_r8
      rate(:,539) = 1.3e-10_r8
      rate(:,540) = 7.65e-11_r8
      rate(:,549) = 1.31e-10_r8
      rate(:,550) = 3.5e-11_r8
      rate(:,551) = 9e-12_r8
      rate(:,555) = 2.3e-12_r8
      rate(:,556) = 1.2e-11_r8
      rate(:,557) = 5.7e-11_r8
      rate(:,558) = 2.8e-11_r8
      rate(:,559) = 6.6e-11_r8
      rate(:,560) = 1.4e-11_r8
      rate(:,563) = 1.9e-12_r8
      rate(:,594) = 6e-11_r8
      rate(:,597) = 1e-12_r8
      rate(:,598) = 4e-10_r8
      rate(:,599) = 2e-10_r8
      rate(:,600) = 1e-10_r8
      rate(:,601) = 5e-16_r8
      rate(:,602) = 4.4e-10_r8
      rate(:,603) = 9e-10_r8
      do n = 1,pver
        offset = (n-1)*ncol
        itemp(offset+1:offset+ncol) = 1._r8 / temp(:ncol,n)
      end do
      rate(:,350) = 1.8e-11_r8 * exp( 390._r8 * itemp(:) )
      rate(:,401) = 1.63e-10_r8 * exp( 60._r8 * itemp(:) )
      rate(:,402) = 2.15e-11_r8 * exp( 110._r8 * itemp(:) )
      exp_fac(:) = exp( 55._r8 * itemp(:) )
      rate(:,403) = 2.64e-11_r8 * exp_fac(:)
      rate(:,404) = 6.6e-12_r8 * exp_fac(:)
      rate(:,408) = 3.6e-18_r8 * exp( -220._r8 * itemp(:) )
      rate(:,410) = 1.8e-15_r8 * exp( 45._r8 * itemp(:) )
      rate(:,413) = 3.5e-11_r8 * exp( -135._r8 * itemp(:) )
      rate(:,414) = 8e-12_r8 * exp( -2060._r8 * itemp(:) )
      rate(:,417) = 1.6e-11_r8 * exp( -4570._r8 * itemp(:) )
      rate(:,418) = 1.4e-12_r8 * exp( -2000._r8 * itemp(:) )
      exp_fac(:) = exp( 200._r8 * itemp(:) )
      rate(:,423) = 3e-11_r8 * exp_fac(:)
      rate(:,511) = 5.5e-12_r8 * exp_fac(:)
      rate(:,546) = 3.8e-12_r8 * exp_fac(:)
      rate(:,424) = 1e-14_r8 * exp( -490._r8 * itemp(:) )
      rate(:,425) = 1.4e-10_r8 * exp( -470._r8 * itemp(:) )
      rate(:,426) = 2.8e-12_r8 * exp( -1800._r8 * itemp(:) )
      exp_fac(:) = exp( 250._r8 * itemp(:) )
      rate(:,428) = 4.8e-11_r8 * exp_fac(:)
      rate(:,509) = 1.7e-11_r8 * exp_fac(:)
      rate(:,429) = 1.8e-11_r8 * exp( 180._r8 * itemp(:) )
      rate(:,430) = 1.7e-12_r8 * exp( -940._r8 * itemp(:) )
      rate(:,434) = 1.3e-12_r8 * exp( 380._r8 * itemp(:) )
      rate(:,437) = 2.1e-11_r8 * exp( 100._r8 * itemp(:) )
      exp_fac(:) = exp( 220._r8 * itemp(:) )
      rate(:,438) = 2.9e-12_r8 * exp_fac(:)
      rate(:,439) = 1.45e-12_r8 * exp_fac(:)
      rate(:,440) = 1.45e-12_r8 * exp_fac(:)
      rate(:,441) = 1.5e-11_r8 * exp( -3600._r8 * itemp(:) )
      rate(:,442) = 5.1e-12_r8 * exp( 210._r8 * itemp(:) )
      exp_fac(:) = exp( -2450._r8 * itemp(:) )
      rate(:,443) = 1.2e-13_r8 * exp_fac(:)
      rate(:,469) = 3e-11_r8 * exp_fac(:)
      rate(:,446) = 1.5e-11_r8 * exp( 170._r8 * itemp(:) )
      exp_fac(:) = exp( 270._r8 * itemp(:) )
      rate(:,450) = 3.3e-12_r8 * exp_fac(:)
      rate(:,465) = 1.4e-11_r8 * exp_fac(:)
      rate(:,479) = 7.4e-12_r8 * exp_fac(:)
      exp_fac(:) = exp( -1500._r8 * itemp(:) )
      rate(:,451) = 3e-12_r8 * exp_fac(:)
      rate(:,510) = 5.8e-12_r8 * exp_fac(:)
      exp_fac(:) = exp( 20._r8 * itemp(:) )
      rate(:,453) = 7.26e-11_r8 * exp_fac(:)
      rate(:,454) = 4.64e-11_r8 * exp_fac(:)
      rate(:,461) = 8.1e-11_r8 * exp( -30._r8 * itemp(:) )
      rate(:,462) = 7.1e-12_r8 * exp( -1270._r8 * itemp(:) )
      rate(:,463) = 3.05e-11_r8 * exp( -2270._r8 * itemp(:) )
      rate(:,464) = 1.1e-11_r8 * exp( -980._r8 * itemp(:) )
      rate(:,466) = 3.6e-11_r8 * exp( -375._r8 * itemp(:) )
      rate(:,467) = 2.3e-11_r8 * exp( -200._r8 * itemp(:) )
      rate(:,468) = 3.3e-12_r8 * exp( -115._r8 * itemp(:) )
      rate(:,470) = 1e-12_r8 * exp( -1590._r8 * itemp(:) )
      rate(:,471) = 3.5e-13_r8 * exp( -1370._r8 * itemp(:) )
      exp_fac(:) = exp( 290._r8 * itemp(:) )
      rate(:,472) = 2.6e-12_r8 * exp_fac(:)
      rate(:,473) = 6.4e-12_r8 * exp_fac(:)
      rate(:,503) = 4.1e-13_r8 * exp_fac(:)
      rate(:,474) = 6.5e-12_r8 * exp( 135._r8 * itemp(:) )
      exp_fac(:) = exp( -840._r8 * itemp(:) )
      rate(:,476) = 3.6e-12_r8 * exp_fac(:)
      rate(:,525) = 2e-12_r8 * exp_fac(:)
      rate(:,477) = 1.2e-12_r8 * exp( -330._r8 * itemp(:) )
      rate(:,478) = 2.8e-11_r8 * exp( 85._r8 * itemp(:) )
      exp_fac(:) = exp( 230._r8 * itemp(:) )
      rate(:,480) = 6e-13_r8 * exp_fac(:)
      rate(:,500) = 1.5e-12_r8 * exp_fac(:)
      rate(:,508) = 1.9e-11_r8 * exp_fac(:)
      rate(:,481) = 1e-11_r8 * exp( -3300._r8 * itemp(:) )
      rate(:,482) = 1.8e-12_r8 * exp( -250._r8 * itemp(:) )
      rate(:,483) = 3.4e-12_r8 * exp( -130._r8 * itemp(:) )
      exp_fac(:) = exp( -500._r8 * itemp(:) )
      rate(:,485) = 3e-12_r8 * exp_fac(:)
      rate(:,519) = 1.4e-10_r8 * exp_fac(:)
      exp_fac(:) = exp( -800._r8 * itemp(:) )
      rate(:,497) = 1.7e-11_r8 * exp_fac(:)
      rate(:,524) = 6.3e-12_r8 * exp_fac(:)
      rate(:,498) = 4.8e-12_r8 * exp( -310._r8 * itemp(:) )
      rate(:,499) = 1.6e-11_r8 * exp( -780._r8 * itemp(:) )
      rate(:,501) = 9.5e-13_r8 * exp( 550._r8 * itemp(:) )
      exp_fac(:) = exp( 260._r8 * itemp(:) )
      rate(:,502) = 2.3e-12_r8 * exp_fac(:)
      rate(:,505) = 8.8e-12_r8 * exp_fac(:)
      rate(:,504) = 4.5e-12_r8 * exp( 460._r8 * itemp(:) )
      rate(:,507) = 1.9e-11_r8 * exp( 215._r8 * itemp(:) )
      rate(:,512) = 1.2e-10_r8 * exp( -430._r8 * itemp(:) )
      rate(:,518) = 1.6e-10_r8 * exp( -260._r8 * itemp(:) )
      exp_fac(:) = exp( 0._r8 * itemp(:) )
      rate(:,520) = 1.4e-11_r8 * exp_fac(:)
      rate(:,522) = 2.14e-11_r8 * exp_fac(:)
      rate(:,523) = 1.9e-10_r8 * exp_fac(:)
      rate(:,536) = 2.57e-10_r8 * exp_fac(:)
      rate(:,537) = 1.8e-10_r8 * exp_fac(:)
      rate(:,538) = 1.794e-10_r8 * exp_fac(:)
      rate(:,539) = 1.3e-10_r8 * exp_fac(:)
      rate(:,540) = 7.65e-11_r8 * exp_fac(:)
      rate(:,549) = 1.31e-10_r8 * exp_fac(:)
      rate(:,550) = 3.5e-11_r8 * exp_fac(:)
      rate(:,551) = 9e-12_r8 * exp_fac(:)
      rate(:,555) = 2.3e-12_r8 * exp_fac(:)
      rate(:,556) = 1.2e-11_r8 * exp_fac(:)
      rate(:,557) = 5.7e-11_r8 * exp_fac(:)
      rate(:,558) = 2.8e-11_r8 * exp_fac(:)
      rate(:,559) = 6.6e-11_r8 * exp_fac(:)
      rate(:,560) = 1.4e-11_r8 * exp_fac(:)
      rate(:,563) = 1.9e-12_r8 * exp_fac(:)
      rate(:,594) = 6e-11_r8 * exp_fac(:)
      rate(:,597) = 1e-12_r8 * exp_fac(:)
      rate(:,598) = 4e-10_r8 * exp_fac(:)
      rate(:,599) = 2e-10_r8 * exp_fac(:)
      rate(:,600) = 1e-10_r8 * exp_fac(:)
      rate(:,601) = 5e-16_r8 * exp_fac(:)
      rate(:,602) = 4.4e-10_r8 * exp_fac(:)
      rate(:,603) = 9e-10_r8 * exp_fac(:)
      rate(:,521) = 6e-12_r8 * exp( 400._r8 * itemp(:) )
      rate(:,526) = 1.46e-11_r8 * exp( -1040._r8 * itemp(:) )
      rate(:,527) = 1.42e-12_r8 * exp( -1150._r8 * itemp(:) )
      rate(:,528) = 1.64e-12_r8 * exp( -1520._r8 * itemp(:) )
      exp_fac(:) = exp( -1100._r8 * itemp(:) )
      rate(:,529) = 2.03e-11_r8 * exp_fac(:)
      rate(:,562) = 3.4e-12_r8 * exp_fac(:)
      rate(:,530) = 1.96e-12_r8 * exp( -1200._r8 * itemp(:) )
      rate(:,531) = 4.85e-12_r8 * exp( -850._r8 * itemp(:) )
      rate(:,532) = 9e-13_r8 * exp( -360._r8 * itemp(:) )
      exp_fac(:) = exp( -1600._r8 * itemp(:) )
      rate(:,533) = 1.25e-12_r8 * exp_fac(:)
      rate(:,542) = 3.4e-11_r8 * exp_fac(:)
      rate(:,534) = 1.3e-12_r8 * exp( -1770._r8 * itemp(:) )
      rate(:,535) = 9.2e-13_r8 * exp( -1560._r8 * itemp(:) )
      rate(:,541) = 6e-13_r8 * exp( -2058._r8 * itemp(:) )
      rate(:,543) = 5.5e-12_r8 * exp( 125._r8 * itemp(:) )
      rate(:,544) = 4.1e-13_r8 * exp( 750._r8 * itemp(:) )
      rate(:,545) = 2.8e-12_r8 * exp( 300._r8 * itemp(:) )
      rate(:,547) = 2.45e-12_r8 * exp( -1775._r8 * itemp(:) )
      rate(:,553) = 2.1e-11_r8 * exp( -2200._r8 * itemp(:) )
      rate(:,554) = 7.2e-14_r8 * exp( -1070._r8 * itemp(:) )
      rate(:,561) = 1.6e-13_r8 * exp( -2280._r8 * itemp(:) )
      rate(:,564) = 2.7e-11_r8 * exp( 335._r8 * itemp(:) )
      rate(:,567) = 1.9e-13_r8 * exp( 520._r8 * itemp(:) )
      rate(:,568) = 9.6e-12_r8 * exp( -234._r8 * itemp(:) )
      itemp(:) = 300._r8 * itemp(:)
      n = ncol*pver
      ko(:) = 7e-31_r8 * itemp(:)**2.6_r8
      kinf(:) = 3.6e-11_r8 * itemp(:)**0.1_r8
      call jpl( rate(:,359), m, 0.6_r8, ko, kinf, n )
      ko(:) = 4.4e-32_r8 * itemp(:)**1.3_r8
      kinf(:) = 7.5e-11_r8 * itemp(:)**(-0.2_r8)
      call jpl( rate(:,422), m, 0.6_r8, ko, kinf, n )
      ko(:) = 6.9e-31_r8 * itemp(:)**1._r8
      kinf(:) = 2.6e-11_r8
      call jpl( rate(:,432), m, 0.6_r8, ko, kinf, n )
      ko(:) = 2.5e-31_r8 * itemp(:)**1.8_r8
      kinf(:) = 2.2e-11_r8 * itemp(:)**0.7_r8
      call jpl( rate(:,444), m, 0.6_r8, ko, kinf, n )
      ko(:) = 9e-32_r8 * itemp(:)**1.5_r8
      kinf(:) = 3e-11_r8
      call jpl( rate(:,452), m, 0.6_r8, ko, kinf, n )
      ko(:) = 1.9e-31_r8 * itemp(:)**3.4_r8
      kinf(:) = 4e-12_r8 * itemp(:)**0.3_r8
      call jpl( rate(:,455), m, 0.6_r8, ko, kinf, n )
      ko(:) = 2.4e-30_r8 * itemp(:)**3._r8
      kinf(:) = 1.6e-12_r8 * itemp(:)**(-0.1_r8)
      call jpl( rate(:,456), m, 0.6_r8, ko, kinf, n )
      ko(:) = 1.8e-30_r8 * itemp(:)**3._r8
      kinf(:) = 2.8e-11_r8
      call jpl( rate(:,457), m, 0.6_r8, ko, kinf, n )
      ko(:) = 1.8e-31_r8 * itemp(:)**3.4_r8
      kinf(:) = 1.5e-11_r8 * itemp(:)**1.9_r8
      call jpl( rate(:,475), m, 0.6_r8, ko, kinf, n )
      ko(:) = 1.9e-32_r8 * itemp(:)**3.6_r8
      kinf(:) = 3.7e-12_r8 * itemp(:)**1.6_r8
      call jpl( rate(:,495), m, 0.6_r8, ko, kinf, n )
      ko(:) = 5.2e-31_r8 * itemp(:)**3.2_r8
      kinf(:) = 6.9e-12_r8 * itemp(:)**2.9_r8
      call jpl( rate(:,506), m, 0.6_r8, ko, kinf, n )
      ko(:) = 5.9e-33_r8 * itemp(:)**1._r8
      kinf(:) = 1.1e-12_r8 * itemp(:)**(-1.3_r8)
      call jpl( rate(:,548), m, 0.6_r8, ko, kinf, n )
      end subroutine setrxt
      subroutine setrxt_hrates( rate, temp, m, ncol, kbot )
      use ppgrid, only : pcols, pver
      use chem_mods, only : rxntot
      use mo_jpl, only : jpl
      implicit none
!-------------------------------------------------------
! ... dummy arguments
!-------------------------------------------------------
      integer, intent(in) :: ncol
      integer, intent(in) :: kbot
      real(r8), intent(in) :: temp(pcols,pver)
      real(r8), intent(in) :: m(ncol*pver)
      real(r8), intent(inout) :: rate(ncol*pver,max(1,rxntot))
!-------------------------------------------------------
! ... local variables
!-------------------------------------------------------
      integer :: n
      integer :: offset
      integer :: k
      real(r8) :: itemp(ncol*kbot)
      real(r8) :: exp_fac(ncol*kbot)
      real(r8) :: ko(ncol*kbot)
      real(r8) :: kinf(ncol*kbot)
      real(r8) :: wrk(ncol*kbot)
      n = ncol*kbot
      rate(:n,406) = 1e-20_r8
      rate(:n,407) = 1.3e-16_r8
      rate(:n,411) = 8e-14_r8
      rate(:n,412) = 3.9e-17_r8
      rate(:n,419) = 6.9e-12_r8
      rate(:n,435) = 7e-13_r8
      rate(:n,436) = 5e-12_r8
      rate(:n,594) = 6e-11_r8
      rate(:n,597) = 1e-12_r8
      rate(:n,598) = 4e-10_r8
      rate(:n,599) = 2e-10_r8
      rate(:n,600) = 1e-10_r8
      rate(:n,602) = 4.4e-10_r8
      do k = 1,kbot
        offset = (k-1)*ncol
        itemp(offset+1:offset+ncol) = 1._r8 / temp(:ncol,k)
      end do
      rate(:n,402) = 2.15e-11_r8 * exp( 110._r8 * itemp(:) )
      exp_fac(:) = exp( 55._r8 * itemp(:) )
      rate(:n,403) = 2.64e-11_r8 * exp_fac(:)
      rate(:n,404) = 6.6e-12_r8 * exp_fac(:)
      rate(:n,408) = 3.6e-18_r8 * exp( -220._r8 * itemp(:) )
      rate(:n,410) = 1.8e-15_r8 * exp( 45._r8 * itemp(:) )
      rate(:n,413) = 3.5e-11_r8 * exp( -135._r8 * itemp(:) )
      rate(:n,414) = 8e-12_r8 * exp( -2060._r8 * itemp(:) )
      rate(:n,423) = 3e-11_r8 * exp( 200._r8 * itemp(:) )
      rate(:n,424) = 1e-14_r8 * exp( -490._r8 * itemp(:) )
      rate(:n,425) = 1.4e-10_r8 * exp( -470._r8 * itemp(:) )
      rate(:n,428) = 4.8e-11_r8 * exp( 250._r8 * itemp(:) )
      rate(:n,429) = 1.8e-11_r8 * exp( 180._r8 * itemp(:) )
      rate(:n,430) = 1.7e-12_r8 * exp( -940._r8 * itemp(:) )
      rate(:n,437) = 2.1e-11_r8 * exp( 100._r8 * itemp(:) )
      rate(:n,441) = 1.5e-11_r8 * exp( -3600._r8 * itemp(:) )
      rate(:n,442) = 5.1e-12_r8 * exp( 210._r8 * itemp(:) )
      rate(:n,450) = 3.3e-12_r8 * exp( 270._r8 * itemp(:) )
      rate(:n,451) = 3e-12_r8 * exp( -1500._r8 * itemp(:) )
      itemp(:) = 300._r8 * itemp(:)
      ko(:) = 4.4e-32_r8 * itemp(:)**1.3_r8
      kinf(:) = 7.5e-11_r8 * itemp(:)**(-0.2_r8)
      call jpl( wrk, m, 0.6_r8, ko, kinf, n )
      rate(:n,422) = wrk(:)
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
      rate(:,:,108) = rate(:,:,108) * inv(:,:, 1)
      rate(:,:,109) = rate(:,:,109) * inv(:,:, 1)
      rate(:,:,120) = rate(:,:,120) * inv(:,:, 1)
      rate(:,:,121) = rate(:,:,121) * inv(:,:, 1)
      rate(:,:,136) = rate(:,:,136) * inv(:,:, 2)
      rate(:,:,138) = rate(:,:,138) * inv(:,:, 1)
      rate(:,:,140) = rate(:,:,140) * inv(:,:, 2)
      rate(:,:,261) = rate(:,:,261) * inv(:,:, 1)
      rate(:,:,262) = rate(:,:,262) * inv(:,:, 1)
      rate(:,:,263) = rate(:,:,263) * inv(:,:, 1)
      rate(:,:,264) = rate(:,:,264) * inv(:,:, 1)
      rate(:,:,265) = rate(:,:,265) * inv(:,:, 1)
      rate(:,:,266) = rate(:,:,266) * inv(:,:, 1)
      rate(:,:,267) = rate(:,:,267) * inv(:,:, 1)
      rate(:,:,268) = rate(:,:,268) * inv(:,:, 1)
      rate(:,:,269) = rate(:,:,269) * inv(:,:, 1)
      rate(:,:,270) = rate(:,:,270) * inv(:,:, 1)
      rate(:,:,271) = rate(:,:,271) * inv(:,:, 1)
      rate(:,:,272) = rate(:,:,272) * inv(:,:, 1)
      rate(:,:,273) = rate(:,:,273) * inv(:,:, 1)
      rate(:,:,274) = rate(:,:,274) * inv(:,:, 1)
      rate(:,:,277) = rate(:,:,277) * inv(:,:, 1)
      rate(:,:,278) = rate(:,:,278) * inv(:,:, 1)
      rate(:,:,279) = rate(:,:,279) * inv(:,:, 1)
      rate(:,:,280) = rate(:,:,280) * inv(:,:, 1)
      rate(:,:,281) = rate(:,:,281) * inv(:,:, 1)
      rate(:,:,287) = rate(:,:,287) * inv(:,:, 1)
      rate(:,:,288) = rate(:,:,288) * inv(:,:, 1)
      rate(:,:,292) = rate(:,:,292) * inv(:,:, 1)
      rate(:,:,298) = rate(:,:,298) * inv(:,:, 1)
      rate(:,:,300) = rate(:,:,300) * inv(:,:, 1)
      rate(:,:,304) = rate(:,:,304) * inv(:,:, 1)
      rate(:,:,323) = rate(:,:,323) * inv(:,:, 1)
      rate(:,:,329) = rate(:,:,329) * inv(:,:, 1)
      rate(:,:,336) = rate(:,:,336) * inv(:,:, 1)
      rate(:,:,338) = rate(:,:,338) * inv(:,:, 2)
      rate(:,:,353) = rate(:,:,353) * inv(:,:, 1)
      rate(:,:,359) = rate(:,:,359) * inv(:,:, 1)
      rate(:,:,362) = rate(:,:,362) * inv(:,:, 1)
      rate(:,:,368) = rate(:,:,368) * inv(:,:, 1)
      rate(:,:,372) = rate(:,:,372) * inv(:,:, 1)
      rate(:,:,375) = rate(:,:,375) * inv(:,:, 1)
      rate(:,:,376) = rate(:,:,376) * inv(:,:, 1)
      rate(:,:,377) = rate(:,:,377) * inv(:,:, 1)
      rate(:,:,378) = rate(:,:,378) * inv(:,:, 1)
      rate(:,:,379) = rate(:,:,379) * inv(:,:, 1)
      rate(:,:,380) = rate(:,:,380) * inv(:,:, 1)
      rate(:,:,382) = rate(:,:,382) * inv(:,:, 1)
      rate(:,:,383) = rate(:,:,383) * inv(:,:, 1)
      rate(:,:,384) = rate(:,:,384) * inv(:,:, 1)
      rate(:,:,385) = rate(:,:,385) * inv(:,:, 1)
      rate(:,:,386) = rate(:,:,386) * inv(:,:, 1)
      rate(:,:,387) = rate(:,:,387) * inv(:,:, 1)
      rate(:,:,388) = rate(:,:,388) * inv(:,:, 1)
      rate(:,:,389) = rate(:,:,389) * inv(:,:, 1)
      rate(:,:,390) = rate(:,:,390) * inv(:,:, 1)
      rate(:,:,396) = rate(:,:,396) * inv(:,:, 1)
      rate(:,:,397) = rate(:,:,397) * inv(:,:, 1)
      rate(:,:,402) = rate(:,:,402) * inv(:,:, 2)
      rate(:,:,406) = rate(:,:,406) * inv(:,:, 2)
      rate(:,:,410) = rate(:,:,410) * inv(:,:, 2)
      rate(:,:,415) = rate(:,:,415) * inv(:,:, 1)
      rate(:,:,416) = rate(:,:,416) * inv(:,:, 1)
      rate(:,:,422) = rate(:,:,422) * inv(:,:, 1)
      rate(:,:,432) = rate(:,:,432) * inv(:,:, 1)
      rate(:,:,444) = rate(:,:,444) * inv(:,:, 1)
      rate(:,:,452) = rate(:,:,452) * inv(:,:, 1)
      rate(:,:,455) = rate(:,:,455) * inv(:,:, 1)
      rate(:,:,456) = rate(:,:,456) * inv(:,:, 1)
      rate(:,:,457) = rate(:,:,457) * inv(:,:, 1)
      rate(:,:,459) = rate(:,:,459) * inv(:,:, 1)
      rate(:,:,460) = rate(:,:,460) * inv(:,:, 1)
      rate(:,:,475) = rate(:,:,475) * inv(:,:, 1)
      rate(:,:,495) = rate(:,:,495) * inv(:,:, 1)
      rate(:,:,496) = rate(:,:,496) * inv(:,:, 1)
      rate(:,:,506) = rate(:,:,506) * inv(:,:, 1)
      rate(:,:,548) = rate(:,:,548) * inv(:,:, 1)
      rate(:,:,601) = rate(:,:,601) * inv(:,:, 2)
      rate(:,:,604) = rate(:,:,604) * inv(:,:, 2)
      rate(:,:,381) = rate(:,:,381) * inv(:,:, 2) * inv(:,:, 1)
      rate(:,:,106) = rate(:,:,106) * m(:,:)
      rate(:,:,107) = rate(:,:,107) * m(:,:)
      rate(:,:,108) = rate(:,:,108) * m(:,:)
      rate(:,:,109) = rate(:,:,109) * m(:,:)
      rate(:,:,110) = rate(:,:,110) * m(:,:)
      rate(:,:,111) = rate(:,:,111) * m(:,:)
      rate(:,:,112) = rate(:,:,112) * m(:,:)
      rate(:,:,113) = rate(:,:,113) * m(:,:)
      rate(:,:,114) = rate(:,:,114) * m(:,:)
      rate(:,:,116) = rate(:,:,116) * m(:,:)
      rate(:,:,117) = rate(:,:,117) * m(:,:)
      rate(:,:,118) = rate(:,:,118) * m(:,:)
      rate(:,:,119) = rate(:,:,119) * m(:,:)
      rate(:,:,120) = rate(:,:,120) * m(:,:)
      rate(:,:,121) = rate(:,:,121) * m(:,:)
      rate(:,:,122) = rate(:,:,122) * m(:,:)
      rate(:,:,123) = rate(:,:,123) * m(:,:)
      rate(:,:,124) = rate(:,:,124) * m(:,:)
      rate(:,:,125) = rate(:,:,125) * m(:,:)
      rate(:,:,126) = rate(:,:,126) * m(:,:)
      rate(:,:,127) = rate(:,:,127) * m(:,:)
      rate(:,:,128) = rate(:,:,128) * m(:,:)
      rate(:,:,129) = rate(:,:,129) * m(:,:)
      rate(:,:,130) = rate(:,:,130) * m(:,:)
      rate(:,:,131) = rate(:,:,131) * m(:,:)
      rate(:,:,132) = rate(:,:,132) * m(:,:)
      rate(:,:,133) = rate(:,:,133) * m(:,:)
      rate(:,:,134) = rate(:,:,134) * m(:,:)
      rate(:,:,136) = rate(:,:,136) * m(:,:)
      rate(:,:,137) = rate(:,:,137) * m(:,:)
      rate(:,:,138) = rate(:,:,138) * m(:,:)
      rate(:,:,139) = rate(:,:,139) * m(:,:)
      rate(:,:,141) = rate(:,:,141) * m(:,:)
      rate(:,:,142) = rate(:,:,142) * m(:,:)
      rate(:,:,143) = rate(:,:,143) * m(:,:)
      rate(:,:,144) = rate(:,:,144) * m(:,:)
      rate(:,:,145) = rate(:,:,145) * m(:,:)
      rate(:,:,146) = rate(:,:,146) * m(:,:)
      rate(:,:,147) = rate(:,:,147) * m(:,:)
      rate(:,:,148) = rate(:,:,148) * m(:,:)
      rate(:,:,149) = rate(:,:,149) * m(:,:)
      rate(:,:,150) = rate(:,:,150) * m(:,:)
      rate(:,:,151) = rate(:,:,151) * m(:,:)
      rate(:,:,152) = rate(:,:,152) * m(:,:)
      rate(:,:,153) = rate(:,:,153) * m(:,:)
      rate(:,:,154) = rate(:,:,154) * m(:,:)
      rate(:,:,155) = rate(:,:,155) * m(:,:)
      rate(:,:,156) = rate(:,:,156) * m(:,:)
      rate(:,:,157) = rate(:,:,157) * m(:,:)
      rate(:,:,158) = rate(:,:,158) * m(:,:)
      rate(:,:,159) = rate(:,:,159) * m(:,:)
      rate(:,:,160) = rate(:,:,160) * m(:,:)
      rate(:,:,161) = rate(:,:,161) * m(:,:)
      rate(:,:,162) = rate(:,:,162) * m(:,:)
      rate(:,:,163) = rate(:,:,163) * m(:,:)
      rate(:,:,164) = rate(:,:,164) * m(:,:)
      rate(:,:,165) = rate(:,:,165) * m(:,:)
      rate(:,:,166) = rate(:,:,166) * m(:,:)
      rate(:,:,167) = rate(:,:,167) * m(:,:)
      rate(:,:,168) = rate(:,:,168) * m(:,:)
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
      rate(:,:,217) = rate(:,:,217) * m(:,:)
      rate(:,:,218) = rate(:,:,218) * m(:,:)
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
      rate(:,:,254) = rate(:,:,254) * m(:,:)
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
      rate(:,:,281) = rate(:,:,281) * m(:,:)
      rate(:,:,282) = rate(:,:,282) * m(:,:)
      rate(:,:,283) = rate(:,:,283) * m(:,:)
      rate(:,:,284) = rate(:,:,284) * m(:,:)
      rate(:,:,285) = rate(:,:,285) * m(:,:)
      rate(:,:,286) = rate(:,:,286) * m(:,:)
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
      rate(:,:,315) = rate(:,:,315) * m(:,:)
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
      rate(:,:,339) = rate(:,:,339) * m(:,:)
      rate(:,:,340) = rate(:,:,340) * m(:,:)
      rate(:,:,341) = rate(:,:,341) * m(:,:)
      rate(:,:,342) = rate(:,:,342) * m(:,:)
      rate(:,:,343) = rate(:,:,343) * m(:,:)
      rate(:,:,344) = rate(:,:,344) * m(:,:)
      rate(:,:,345) = rate(:,:,345) * m(:,:)
      rate(:,:,346) = rate(:,:,346) * m(:,:)
      rate(:,:,347) = rate(:,:,347) * m(:,:)
      rate(:,:,348) = rate(:,:,348) * m(:,:)
      rate(:,:,349) = rate(:,:,349) * m(:,:)
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
      rate(:,:,383) = rate(:,:,383) * m(:,:)
      rate(:,:,385) = rate(:,:,385) * m(:,:)
      rate(:,:,387) = rate(:,:,387) * m(:,:)
      rate(:,:,389) = rate(:,:,389) * m(:,:)
      rate(:,:,391) = rate(:,:,391) * m(:,:)
      rate(:,:,392) = rate(:,:,392) * m(:,:)
      rate(:,:,393) = rate(:,:,393) * m(:,:)
      rate(:,:,394) = rate(:,:,394) * m(:,:)
      rate(:,:,395) = rate(:,:,395) * m(:,:)
      rate(:,:,400) = rate(:,:,400) * m(:,:)
      rate(:,:,401) = rate(:,:,401) * m(:,:)
      rate(:,:,403) = rate(:,:,403) * m(:,:)
      rate(:,:,404) = rate(:,:,404) * m(:,:)
      rate(:,:,405) = rate(:,:,405) * m(:,:)
      rate(:,:,407) = rate(:,:,407) * m(:,:)
      rate(:,:,408) = rate(:,:,408) * m(:,:)
      rate(:,:,409) = rate(:,:,409) * m(:,:)
      rate(:,:,411) = rate(:,:,411) * m(:,:)
      rate(:,:,412) = rate(:,:,412) * m(:,:)
      rate(:,:,413) = rate(:,:,413) * m(:,:)
      rate(:,:,414) = rate(:,:,414) * m(:,:)
      rate(:,:,415) = rate(:,:,415) * m(:,:)
      rate(:,:,416) = rate(:,:,416) * m(:,:)
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
      rate(:,:,474) = rate(:,:,474) * m(:,:)
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
      rate(:,:,524) = rate(:,:,524) * m(:,:)
      rate(:,:,525) = rate(:,:,525) * m(:,:)
      rate(:,:,526) = rate(:,:,526) * m(:,:)
      rate(:,:,527) = rate(:,:,527) * m(:,:)
      rate(:,:,528) = rate(:,:,528) * m(:,:)
      rate(:,:,529) = rate(:,:,529) * m(:,:)
      rate(:,:,530) = rate(:,:,530) * m(:,:)
      rate(:,:,531) = rate(:,:,531) * m(:,:)
      rate(:,:,532) = rate(:,:,532) * m(:,:)
      rate(:,:,533) = rate(:,:,533) * m(:,:)
      rate(:,:,534) = rate(:,:,534) * m(:,:)
      rate(:,:,535) = rate(:,:,535) * m(:,:)
      rate(:,:,536) = rate(:,:,536) * m(:,:)
      rate(:,:,537) = rate(:,:,537) * m(:,:)
      rate(:,:,538) = rate(:,:,538) * m(:,:)
      rate(:,:,539) = rate(:,:,539) * m(:,:)
      rate(:,:,540) = rate(:,:,540) * m(:,:)
      rate(:,:,541) = rate(:,:,541) * m(:,:)
      rate(:,:,542) = rate(:,:,542) * m(:,:)
      rate(:,:,543) = rate(:,:,543) * m(:,:)
      rate(:,:,544) = rate(:,:,544) * m(:,:)
      rate(:,:,545) = rate(:,:,545) * m(:,:)
      rate(:,:,546) = rate(:,:,546) * m(:,:)
      rate(:,:,547) = rate(:,:,547) * m(:,:)
      rate(:,:,548) = rate(:,:,548) * m(:,:)
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
      rate(:,:,560) = rate(:,:,560) * m(:,:)
      rate(:,:,561) = rate(:,:,561) * m(:,:)
      rate(:,:,562) = rate(:,:,562) * m(:,:)
      rate(:,:,563) = rate(:,:,563) * m(:,:)
      rate(:,:,564) = rate(:,:,564) * m(:,:)
      rate(:,:,565) = rate(:,:,565) * m(:,:)
      rate(:,:,566) = rate(:,:,566) * m(:,:)
      rate(:,:,567) = rate(:,:,567) * m(:,:)
      rate(:,:,568) = rate(:,:,568) * m(:,:)
      rate(:,:,569) = rate(:,:,569) * m(:,:)
      rate(:,:,575) = rate(:,:,575) * m(:,:)
      rate(:,:,580) = rate(:,:,580) * m(:,:)
      rate(:,:,581) = rate(:,:,581) * m(:,:)
      rate(:,:,582) = rate(:,:,582) * m(:,:)
      rate(:,:,585) = rate(:,:,585) * m(:,:)
      rate(:,:,586) = rate(:,:,586) * m(:,:)
      rate(:,:,587) = rate(:,:,587) * m(:,:)
      rate(:,:,590) = rate(:,:,590) * m(:,:)
      rate(:,:,591) = rate(:,:,591) * m(:,:)
      rate(:,:,592) = rate(:,:,592) * m(:,:)
      rate(:,:,593) = rate(:,:,593) * m(:,:)
      rate(:,:,594) = rate(:,:,594) * m(:,:)
      rate(:,:,595) = rate(:,:,595) * m(:,:)
      rate(:,:,596) = rate(:,:,596) * m(:,:)
      rate(:,:,597) = rate(:,:,597) * m(:,:)
      rate(:,:,598) = rate(:,:,598) * m(:,:)
      rate(:,:,599) = rate(:,:,599) * m(:,:)
      rate(:,:,600) = rate(:,:,600) * m(:,:)
      rate(:,:,602) = rate(:,:,602) * m(:,:)
      rate(:,:,603) = rate(:,:,603) * m(:,:)
      rate(:,:,605) = rate(:,:,605) * m(:,:)
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
         p_rate(:,k, 77) = p_rate(:,k, 77) * inv(:,k, 2) * im(:,k)
         p_rate(:,k, 78) = p_rate(:,k, 78) * inv(:,k, 2) * im(:,k)
         p_rate(:,k, 79) = p_rate(:,k, 79) * inv(:,k, 2) * im(:,k)
         p_rate(:,k, 80) = p_rate(:,k, 80) * inv(:,k, 2) * im(:,k)
         p_rate(:,k, 81) = p_rate(:,k, 81) * inv(:,k, 2) * im(:,k)
         p_rate(:,k, 82) = p_rate(:,k, 82) * inv(:,k, 2) * im(:,k)
         p_rate(:,k, 83) = p_rate(:,k, 83) * inv(:,k, 2) * im(:,k)
         p_rate(:,k, 84) = p_rate(:,k, 84) * inv(:,k, 2) * im(:,k)
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
      is_scalar = .false.
      is_vector = .true.
      clscnt(:) = (/ 23, 0, 0, 95, 0 /)
      cls_rxt_cnt(:,1) = (/ 66, 67, 0, 23 /)
      cls_rxt_cnt(:,4) = (/ 30, 162, 412, 95 /)
      solsym(:118) = (/ 'BRCL            ','BRO             ','BRONO2          ','BRY             ','CCL4            ', &
                        'CF2CLBR         ','CF3BR           ','CFC11           ','CFC113          ','CFC114          ', &
                        'CFC115          ','CFC12           ','CH2BR2          ','CH2O            ','CH3BR           ', &
                        'CH3CCL3         ','CH3CL           ','CH3O2           ','CH3OOH          ','CH4             ', &
                        'CHBR3           ','CL2             ','CL2O2           ','CLO             ','CLONO2          ', &
                        'CLY             ','CO              ','CO2             ','CO_25           ','CO_50           ', &
                        'COF2            ','COFCL           ','DMS             ','F               ','H               ', &
                        'H2              ','H2402           ','H2O2            ','H2SO4           ','HBR             ', &
                        'HCFC141B        ','HCFC142B        ','HCFC22          ','HCL             ','HF              ', &
                        'HNO3            ','HO2NO2          ','HOBR            ','HOCL            ','HONO            ', &
                        'N               ','N2O             ','N2O5            ','NO              ','NO2             ', &
                        'NO3             ','O               ','O2              ','O3              ','OCLO            ', &
                        'OCS             ','S               ','SF6             ','SF6em           ','SO              ', &
                        'SO2             ','SO3             ','BR              ','CL              ','CLm             ', &
                        'CLm_H2O         ','CLm_HCL         ','CLOm            ','CO3m            ','CO3m2H2O        ', &
                        'CO3m_H2O        ','CO4m            ','e               ','H3Op_OH         ','HCO3m           ', &
                        'HO2             ','Hp_2H2O         ','Hp_3H2O         ','Hp_3N1          ','Hp_4H2O         ', &
                        'Hp_4N1          ','Hp_5H2O         ','Hp_H2O          ','N2D             ','N2p             ', &
                        'NO2m            ','NO2m_H2O        ','NO3m            ','NO3m2H2O        ','NO3m_H2O        ', &
                        'NO3m_HCL        ','NO3mHNO3        ','NOp             ','NOp_2H2O        ','NOp_3H2O        ', &
                        'NOp_CO2         ','NOp_H2O         ','NOp_N2          ','Np              ','O1D             ', &
                        'O2_1D           ','O2_1S           ','O2m             ','O2p             ','O2p_H2O         ', &
                        'O3m             ','O4m             ','O4p             ','OH              ','OHm             ', &
                        'Om              ','Op              ','H2O             ' /)
      adv_mass(:118) = (/ 115.356700_r8, 95.903400_r8, 141.908940_r8, 99.716850_r8, 153.821800_r8, &
                            165.364506_r8, 148.910210_r8, 137.367503_r8, 187.375310_r8, 170.921013_r8, &
                            154.466716_r8, 120.913206_r8, 173.833800_r8, 30.025200_r8, 94.937200_r8, &
                            133.402300_r8, 50.485900_r8, 47.032000_r8, 48.039400_r8, 16.040600_r8, &
                            252.730400_r8, 70.905400_r8, 102.904200_r8, 51.452100_r8, 97.457640_r8, &
                            100.916850_r8, 28.010400_r8, 44.009800_r8, 28.010400_r8, 28.010400_r8, &
                             66.007206_r8, 82.461503_r8, 62.132400_r8, 18.998403_r8, 1.007400_r8, &
                              2.014800_r8, 259.823613_r8, 34.013600_r8, 98.078400_r8, 80.911400_r8, &
                            116.948003_r8, 100.493706_r8, 86.467906_r8, 36.460100_r8, 20.005803_r8, &
                             63.012340_r8, 79.011740_r8, 96.910800_r8, 52.459500_r8, 47.012940_r8, &
                             14.006740_r8, 44.012880_r8, 108.010480_r8, 30.006140_r8, 46.005540_r8, &
                             62.004940_r8, 15.999400_r8, 31.998800_r8, 47.998200_r8, 67.451500_r8, &
                             60.076400_r8, 32.066000_r8, 146.056419_r8, 146.056419_r8, 48.065400_r8, &
                             64.064800_r8, 80.064200_r8, 79.904000_r8, 35.452700_r8, 35.452700_r8, &
                             53.466900_r8, 71.912800_r8, 51.452100_r8, 60.009200_r8, 96.037600_r8, &
                             78.023400_r8, 76.008600_r8, 0.548567E-03_r8, 36.028400_r8, 61.016600_r8, &
                             33.006200_r8, 37.035800_r8, 55.050000_r8, 118.062340_r8, 73.064200_r8, &
                            136.076540_r8, 91.078400_r8, 19.021600_r8, 14.006740_r8, 28.013480_r8, &
                             46.005540_r8, 64.019740_r8, 62.004940_r8, 98.033340_r8, 80.019140_r8, &
                             98.465040_r8, 125.017280_r8, 30.006140_r8, 66.034540_r8, 68.049340_r8, &
                             74.015940_r8, 48.020340_r8, 58.019620_r8, 14.006740_r8, 15.999400_r8, &
                             31.998800_r8, 31.998800_r8, 31.998800_r8, 31.998800_r8, 50.013000_r8, &
                             47.998200_r8, 63.997600_r8, 63.997600_r8, 17.006800_r8, 17.006800_r8, &
                             15.999400_r8, 15.999400_r8, 18.014200_r8 /)
      crb_mass(:118) = (/ 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 12.011000_r8, &
                             12.011000_r8, 12.011000_r8, 12.011000_r8, 24.022000_r8, 24.022000_r8, &
                             24.022000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, &
                             24.022000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, &
                             12.011000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                             12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, 12.011000_r8, &
                             12.011000_r8, 12.011000_r8, 24.022000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 24.022000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                             24.022000_r8, 24.022000_r8, 12.011000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                             12.011000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 12.011000_r8, 12.011000_r8, &
                             12.011000_r8, 12.011000_r8, 0.000000_r8, 0.000000_r8, 12.011000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                             12.011000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, 0.000000_r8, &
                              0.000000_r8, 0.000000_r8, 0.000000_r8 /)
      fix_mass(: 2) = (/ 0.00000000_r8, 28.0134800_r8 /)
      clsmap(: 23,1) = (/ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, &
                            15, 16, 17, 20, 21, 26, 28, 37, 41, 42, &
                            43, 52, 63 /)
      clsmap(: 95,4) = (/ 1, 2, 3, 14, 18, 19, 22, 23, 24, 25, &
                            27, 29, 30, 31, 32, 33, 34, 35, 36, 38, &
                            39, 40, 44, 45, 46, 47, 48, 49, 50, 51, &
                            53, 54, 55, 56, 57, 58, 59, 60, 61, 62, &
                            64, 65, 66, 67, 68, 69, 70, 71, 72, 73, &
                            74, 75, 76, 77, 78, 79, 80, 81, 82, 83, &
                            84, 85, 86, 87, 88, 89, 90, 91, 92, 93, &
                            94, 95, 96, 97, 98, 99, 100, 101, 102, 103, &
                           104, 105, 106, 107, 108, 109, 110, 111, 112, 113, &
                           114, 115, 116, 117, 118 /)
      permute(: 95,4) = (/ 9, 63, 27, 64, 47, 18, 7, 4, 90, 43, &
                             28, 1, 2, 5, 8, 15, 37, 89, 58, 29, &
                              6, 39, 80, 10, 81, 22, 38, 40, 35, 46, &
                             45, 84, 82, 87, 77, 94, 73, 16, 17, 32, &
                              3, 51, 42, 12, 56, 74, 67, 53, 52, 44, &
                             71, 50, 61, 66, 72, 19, 48, 69, 30, 78, &
                             13, 88, 14, 83, 33, 26, 31, 91, 54, 68, &
                             60, 62, 57, 59, 75, 76, 20, 24, 79, 23, &
                             25, 65, 41, 11, 85, 86, 34, 55, 21, 49, &
                             70, 92, 93, 36, 95 /)
      diag_map(: 95) = (/ 1, 2, 3, 4, 7, 10, 13, 15, 19, 22, &
                            25, 29, 33, 37, 41, 47, 52, 60, 66, 72, &
                            78, 84, 91, 98, 104, 111, 116, 124, 128, 135, &
                           142, 152, 160, 168, 176, 182, 192, 201, 209, 218, &
                           225, 234, 242, 252, 262, 276, 288, 299, 314, 326, &
                           343, 357, 373, 388, 402, 418, 429, 448, 467, 483, &
                           503, 524, 548, 570, 601, 624, 654, 677, 711, 758, &
                           786, 827, 868, 911, 957,1000,1058,1101,1143,1188, &
                          1228,1275,1318,1360,1396,1441,1481,1524,1560,1605, &
                          1635,1668,1704,1752,1811 /)
      extfrc_lst(: 11) = (/ 'CO              ','NO              ','NO2             ','N2D             ','e               ', &
                            'OH              ','O2p             ','N               ','O               ','N2p             ', &
                            'Np              ' /)
      frc_from_dataset(: 11) = (/ .true., .true., .true., .false., .false., &
                                  .false., .false., .false., .false., .false., &
                                  .false. /)
      inv_lst(: 2) = (/ 'M               ', 'N2              ' /)
      slvd_lst(: 50) = (/ 'BR              ', 'CL              ', 'CLm             ', 'CLm_H2O         ', 'CLm_HCL         ', &
                          'CLOm            ', 'CO3m            ', 'CO3m2H2O        ', 'CO3m_H2O        ', 'CO4m            ', &
                          'e               ', 'H3Op_OH         ', 'HCO3m           ', 'HO2             ', 'Hp_2H2O         ', &
                          'Hp_3H2O         ', 'Hp_3N1          ', 'Hp_4H2O         ', 'Hp_4N1          ', 'Hp_5H2O         ', &
                          'Hp_H2O          ', 'N2D             ', 'N2p             ', 'NO2m            ', 'NO2m_H2O        ', &
                          'NO3m            ', 'NO3m2H2O        ', 'NO3m_H2O        ', 'NO3m_HCL        ', 'NO3mHNO3        ', &
                          'NOp             ', 'NOp_2H2O        ', 'NOp_3H2O        ', 'NOp_CO2         ', 'NOp_H2O         ', &
                          'NOp_N2          ', 'Np              ', 'O1D             ', 'O2_1D           ', 'O2_1S           ', &
                          'O2m             ', 'O2p             ', 'O2p_H2O         ', 'O3m             ', 'O4m             ', &
                          'O4p             ', 'OH              ', 'OHm             ', 'Om              ', 'Op              ' /)
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
      rxt_tag_lst(:rxt_tag_cnt) = (/ 'jpni3           ', 'jpni5           ', 'jpni4           ', 'jhono           ', &
                                     'jepn6           ', 'jepn7           ', 'jepn2           ', 'jppi            ', &
                                     'jjepn3          ', 'jpni1           ', 'jpni2           ', 'jepn4           ', &
                                     'jepn1           ', 'jh2o_b          ', 'jh2o_c          ', 'jh2o_a          ', &
                                     'jh2o2           ', 'jo2_b           ', 'jo2_a           ', 'jo3_a           ', &
                                     'jo3_b           ', 'jhno3           ', 'jho2no2_a       ', 'jho2no2_b       ', &
                                     'jn2o            ', 'jn2o5_a         ', 'jn2o5_b         ', 'jno             ', &
                                     'jno_i           ', 'jno2            ', 'jno3_a          ', 'jno3_b          ', &
                                     'jch2o_a         ', 'jch2o_b         ', 'jch3ooh         ', 'jch4_a          ', &
                                     'jch4_b          ', 'jco2            ', 'jbrcl           ', 'jbro            ', &
                                     'jbrono2_b       ', 'jbrono2_a       ', 'jccl4           ', 'jcf2clbr        ', &
                                     'jcf3br          ', 'jcfcl3          ', 'jcfc113         ', 'jcfc114         ', &
                                     'jcfc115         ', 'jcf2cl2         ', 'jch2br2         ', 'jch3br          ', &
                                     'jch3ccl3        ', 'jch3cl          ', 'jchbr3          ', 'jcl2            ', &
                                     'jcl2o2          ', 'jclo            ', 'jclono2_a       ', 'jclono2_b       ', &
                                     'jcof2           ', 'jcofcl          ', 'jh2402          ', 'jhbr            ', &
                                     'jhcfc141b       ', 'jhcfc142b       ', 'jhcfc22         ', 'jhcl            ', &
                                     'jhf             ', 'jhobr           ', 'jhocl           ', 'joclo           ', &
                                     'jsf6            ', 'jsf6em          ', 'jeuv_26         ', 'jeuv_4          ', &
                                     'jeuv_13         ', 'jeuv_11         ', 'jeuv_6          ', 'jeuv_10         ', &
                                     'jeuv_22         ', 'jeuv_23         ', 'jeuv_25         ', 'jeuv_18         ', &
                                     'jeuv_2          ', 'jeuv_1          ', 'jeuv_16         ', 'jeuv_15         ', &
                                     'jeuv_14         ', 'jeuv_3          ', 'jeuv_17         ', 'jeuv_9          ', &
                                     'jeuv_8          ', 'jeuv_7          ', 'jeuv_5          ', 'jeuv_19         ', &
                                     'jeuv_20         ', 'jeuv_21         ', 'jeuv_24         ', 'jeuv_12         ', &
                                     'jh2so4          ', 'jocs            ', 'jso             ', 'jso2            ', &
                                     'jso3            ', 'CLm_H           ', 'CLmH2O_HCL      ', 'CLm_H2O_M       ', &
                                     'CLm_HCL_M       ', 'CLm_HNO3        ', 'CLm_NO2         ', 'CLOm_NOa        ', &
                                     'CLOm_NOb        ', 'CLOm_O          ', 'CO_25_tau       ', 'CO3m_CLa        ', &
                                     'CO3m_CLb        ', 'CO3m_CLO        ', 'CO3m_H          ', 'CO3mH2O_H2O_M   ', &
                                     'CO3m_H2O_M      ', 'CO3mH2O_NO2a    ', 'CO3mH2O_NO2b    ', 'CO3mH2O_NOa     ', &
                                     'CO3mH2O_NOb     ', 'CO3m_HNO3       ', 'CO3m_O          ', 'CO3m_O2         ', &
                                     'CO4m_CL         ', 'CO4m_CLO        ', 'CO4m_H          ', 'CO4m_HCL        ', &
                                     'CO4m_O          ', 'CO4m_O3         ', 'CO_50_tau       ', 'ean1            ', &
                                     'ean2            ', 'ean3            ', 'edn1            ', 'edn2            ', &
                                     'H3OpOH_e        ', 'H3OpOH_H2O      ', 'Hp3N1_H2O       ', 'Hp4H2O_e        ', &
                                     'Hp4H2O_N2O5     ', 'Hp4N1_H2O       ', 'Hp5H2O_e        ', 'Hp5H2O_N2O5     ', &
                                     'iira1           ', 'iira10          ', 'iira100         ', 'iira101         ', &
                                     'iira102         ', 'iira103         ', 'iira104         ', 'iira105         ', &
                                     'iira106         ', 'iira107         ', 'iira108         ', 'iira109         ', &
                                     'iira11          ', 'iira110         ', 'iira111         ', 'iira112         ', &
                                     'iira12          ', 'iira13          ', 'iira14          ', 'iira15          ', &
                                     'iira16          ', 'iira17          ', 'iira18          ', 'iira19          ', &
                                     'iira2           ', 'iira20          ', 'iira21          ', 'iira22          ', &
                                     'iira23          ', 'iira24          ', 'iira25          ', 'iira26          ', &
                                     'iira27          ', 'iira28          ', 'iira29          ', 'iira3           ', &
                                     'iira30          ', 'iira31          ', 'iira32          ', 'iira33          ', &
                                     'iira34          ', 'iira35          ', 'iira36          ', 'iira37          ', &
                                     'iira38          ', 'iira39          ', 'iira4           ', 'iira40          ', &
                                     'iira41          ', 'iira42          ', 'iira43          ', 'iira44          ', &
                                     'iira45          ', 'iira46          ', 'iira47          ', 'iira48          ', &
                                     'iira49          ', 'iira5           ', 'iira50          ', 'iira51          ', &
                                     'iira52          ', 'iira53          ', 'iira54          ', 'iira55          ', &
                                     'iira56          ', 'iira57          ', 'iira58          ', 'iira59          ', &
                                     'iira6           ', 'iira60          ', 'iira61          ', 'iira62          ', &
                                     'iira63          ', 'iira64          ', 'iira65          ', 'iira66          ', &
                                     'iira67          ', 'iira68          ', 'iira69          ', 'iira7           ', &
                                     'iira70          ', 'iira71          ', 'iira72          ', 'iira73          ', &
                                     'iira74          ', 'iira75          ', 'iira76          ', 'iira77          ', &
                                     'iira78          ', 'iira79          ', 'iira8           ', 'iira80          ', &
                                     'iira81          ', 'iira82          ', 'iira83          ', 'iira84          ', &
                                     'iira85          ', 'iira86          ', 'iira87          ', 'iira88          ', &
                                     'iira89          ', 'iira9           ', 'iira90          ', 'iira91          ', &
                                     'iira92          ', 'iira93          ', 'iira94          ', 'iira95          ', &
                                     'iira96          ', 'iira97          ', 'iira98          ', 'iira99          ', &
                                     'iirb1           ', 'iirb10          ', 'iirb11          ', 'iirb12          ', &
                                     'iirb13          ', 'iirb14          ', 'iirb2           ', 'iirb3           ', &
                                     'iirb4           ', 'iirb5           ', 'iirb6           ', 'iirb7           ', &
                                     'iirb8           ', 'iirb9           ', 'N2p_O2          ', 'nir1            ', &
                                     'nir10           ', 'nir11           ', 'nir12           ', 'nir13           ', &
                                     'nir14           ', 'nir2            ', 'nir3            ', 'nir4            ', &
                                     'nir5            ', 'nir6            ', 'nir8            ', 'nir9            ', &
                                     'NO2m_CL         ', 'NO2m_CLO        ', 'NO2m_H          ', 'NO2m_H2O_M      ', &
                                     'NO2m_HCL        ', 'NO2m_HNO3       ', 'NO2m_NO2        ', 'NO2m_O3         ', &
                                     'NO3m2H2O_N2O5   ', 'NO3mH2O_H2O_M   ', 'NO3mH2O_HNO3    ', 'NO3m_H2O_M      ', &
                                     'NO3mH2O_N2O5    ', 'NO3m_HCL        ', 'NO3mHCL_HNO3    ', 'NO3m_HNO3_M     ', &
                                     'NO3m_O          ', 'NO3m_O3         ', 'NOp2H2O_e       ', 'NOp3H2O_e       ', &
                                     'NOp3H2O_H2O     ', 'NOpCO2_e        ', 'NOpCO2_H2O      ', 'NOpH2O_e        ', &
                                     'NOpH2O_H        ', 'NOpH2O_HO2      ', 'NOpH2O_OH       ', 'NOpN2_CO2       ', &
                                     'NOpN2_H2O       ', 'Np_O            ', 'Np_O2a          ', 'Np_O2b          ', &
                                     'O2m_CL          ', 'O2m_CLO         ', 'O2m_CO2_M       ', 'O2m_H           ', &
                                     'O2m_HCL         ', 'O2m_HNO3        ', 'O2m_NO2         ', 'O2m_O21D        ', &
                                     'O2m_O2_M        ', 'O2m_O3          ', 'O2m_O_a         ', 'O2m_O_b         ', &
                                     'O2pH2O_e        ', 'O2pH2O_H2Oa     ', 'O2pH2O_H2Ob     ', 'O2p_H2O_M       ', &
                                     'O2p_N           ', 'O2p_N2          ', 'O2p_NO          ', 'O3m_CO2         ', &
                                     'O3m_H           ', 'O3m_O3          ', 'O3m_O_a         ', 'O3m_O_b         ', &
                                     'O4m_CO2         ', 'O4m_O           ', 'O4p_H2O         ', 'O4p_O           ', &
                                     'O4p_O21D        ', 'OH_HONO         ', 'OHm_CL          ', 'OHm_CLO         ', &
                                     'OHm_CO2         ', 'OHm_H           ', 'OHm_HCL         ', 'OHm_NO2         ', &
                                     'OHm_O           ', 'OHm_O3          ', 'OH_NO_M         ', 'Om_CL           ', &
                                     'Om_CLO          ', 'Om_CO2_M        ', 'Om_H2_a         ', 'Om_H2_b         ', &
                                     'Om_H2O          ', 'Om_HCL          ', 'Om_HNO3         ', 'Om_M            ', &
                                     'Om_NO2          ', 'Om_O            ', 'Om_O21D         ', 'Om_O2_M         ', &
                                     'Om_O3           ', 'Op_CO2          ', 'pir1            ', 'pir10           ', &
                                     'pir11           ', 'pir12           ', 'pir13           ', 'pir14           ', &
                                     'pir17           ', 'pir18           ', 'pir2            ', 'pir3            ', &
                                     'pir4            ', 'pir5            ', 'pir6            ', 'pir7            ', &
                                     'pir8            ', 'pir9            ', 'rpe1            ', 'rpe2            ', &
                                     'rpe3            ', 'rpe4            ', 'rpe5            ', 'usr_CLm_H2O_M   ', &
                                     'usr_CLm_HCL_M   ', 'ag1             ', 'ag2             ', 'O1D_H2          ', &
                                     'O1D_H2O         ', 'O1D_N2          ', 'O1D_O2          ', 'O1D_O2b         ', &
                                     'O1D_O3          ', 'O2_1D_N2        ', 'O2_1D_O         ', 'O2_1D_O2        ', &
                                     'O2_1S_CO2       ', 'O2_1S_N2        ', 'O2_1S_O         ', 'O2_1S_O2        ', &
                                     'O2_1S_O3        ', 'O_O3            ', 'usr_O_O         ', 'usr_O_O2        ', &
                                     'H2_O            ', 'H2O2_O          ', 'H_HO2           ', 'H_HO2a          ', &
                                     'H_HO2b          ', 'H_O2            ', 'HO2_O           ', 'HO2_O3          ', &
                                     'H_O3            ', 'OH_H2           ', 'OH_H2O2         ', 'OH_HO2          ', &
                                     'OH_O            ', 'OH_O3           ', 'OH_OH           ', 'OH_OH_M         ', &
                                     'usr_HO2_HO2     ', 'HO2NO2_OH       ', 'N2D_O           ', 'N2D_O2          ', &
                                     'N_NO            ', 'N_NO2a          ', 'N_NO2b          ', 'N_NO2c          ', &
                                     'N_O2            ', 'NO2_O           ', 'NO2_O3          ', 'NO2_O_M         ', &
                                     'NO3_HO2         ', 'NO3_NO          ', 'NO3_O           ', 'NO3_OH          ', &
                                     'N_OH            ', 'NO_HO2          ', 'NO_O3           ', 'NO_O_M          ', &
                                     'O1D_N2Oa        ', 'O1D_N2Ob        ', 'tag_NO2_HO2     ', 'tag_NO2_NO3     ', &
                                     'tag_NO2_OH      ', 'usr_HNO3_OH     ', 'usr_HO2NO2_M    ', 'usr_N2O5_M      ', &
                                     'CL_CH2O         ', 'CL_CH4          ', 'CL_H2           ', 'CL_H2O2         ', &
                                     'CL_HO2a         ', 'CL_HO2b         ', 'CL_O3           ', 'CLO_CH3O2       ', &
                                     'CLO_CLOa        ', 'CLO_CLOb        ', 'CLO_CLOc        ', 'CLO_HO2         ', &
                                     'CLO_NO          ', 'CLONO2_CL       ', 'CLO_NO2_M       ', 'CLONO2_O        ', &
                                     'CLONO2_OH       ', 'CLO_O           ', 'CLO_OHa         ', 'CLO_OHb         ', &
                                     'HCL_O           ', 'HCL_OH          ', 'HOCL_CL         ', 'HOCL_O          ', &
                                     'HOCL_OH         ', 'O1D_CCL4        ', 'O1D_CF2CLBR     ', 'O1D_CFC11       ', &
                                     'O1D_CFC113      ', 'O1D_CFC114      ', 'O1D_CFC115      ', 'O1D_CFC12       ', &
                                     'O1D_HCLa        ', 'O1D_HCLb        ', 'tag_CLO_CLO_M   ', 'usr_CL2O2_M     ', &
                                     'BR_CH2O         ', 'BR_HO2          ', 'BR_O3           ', 'BRO_BRO         ', &
                                     'BRO_CLOa        ', 'BRO_CLOb        ', 'BRO_CLOc        ', 'BRO_HO2         ', &
                                     'BRO_NO          ', 'BRO_NO2_M       ', 'BRONO2_O        ', 'BRO_O           ', &
                                     'BRO_OH          ', 'HBR_O           ', 'HBR_OH          ', 'HOBR_O          ', &
                                     'O1D_CF3BR       ', 'O1D_CHBR3       ', 'O1D_H2402       ', 'O1D_HBRa        ', &
                                     'O1D_HBRb        ', 'F_CH4           ', 'F_H2            ', 'F_H2O           ', &
                                     'F_HNO3          ', 'O1D_COF2        ', 'O1D_COFCL       ', 'CH2BR2_CL       ', &
                                     'CH2BR2_OH       ', 'CH3BR_CL        ', 'CH3BR_OH        ', 'CH3CCL3_OH      ', &
                                     'CH3CL_CL        ', 'CH3CL_OH        ', 'CHBR3_CL        ', 'CHBR3_OH        ', &
                                     'HCFC141B_OH     ', 'HCFC142B_OH     ', 'HCFC22_OH       ', 'O1D_CH2BR2      ', &
                                     'O1D_CH3BR       ', 'O1D_HCFC141B    ', 'O1D_HCFC142B    ', 'O1D_HCFC22      ', &
                                     'CH2O_NO3        ', 'CH2O_O          ', 'CH2O_OH         ', 'CH3O2_HO2       ', &
                                     'CH3O2_NO        ', 'CH3OOH_OH       ', 'CH4_OH          ', 'CO_OH_M         ', &
                                     'O1D_CH4a        ', 'O1D_CH4b        ', 'O1D_CH4c        ', 'usr_CO_OH_b     ', &
                                     'OCS_O           ', 'OCS_OH          ', 'S_O2            ', 'S_O3            ', &
                                     'SO_BRO          ', 'SO_CLO          ', 'S_OH            ', 'SO_NO2          ', &
                                     'SO_O2           ', 'SO_O3           ', 'SO_OCLO         ', 'SO_OH           ', &
                                     'usr_SO2_OH      ', 'usr_SO3_H2O     ', 'DMS_NO3         ', 'DMS_OHa         ', &
                                     'usr_DMS_OH      ', 'usr_HO2_aer     ', 'usr_N2O5_aer    ', 'usr_NO2_aer     ', &
                                     'usr_NO3_aer     ', 'het1            ', 'het10           ', 'het11           ', &
                                     'het12           ', 'het13           ', 'het14           ', 'het15           ', &
                                     'het16           ', 'het17           ', 'het2            ', 'het3            ', &
                                     'het4            ', 'het5            ', 'het6            ', 'het7            ', &
                                     'het8            ', 'het9            ', 'elec1           ', 'elec2           ', &
                                     'elec3           ', 'ion_N2p_O2      ', 'ion_N2p_Oa      ', 'ion_N2p_Ob      ', &
                                     'ion_Np_O        ', 'ion_Np_O2a      ', 'ion_Np_O2b      ', 'ion_O2p_N       ', &
                                     'ion_O2p_N2      ', 'ion_O2p_NO      ', 'ion_Op_CO2      ', 'ion_Op_N2       ', &
                                     'ion_Op_O2       ' /)
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
                                      571, 572, 573, 574, 575, 576, 577, 578, 579, 580, &
                                      581, 582, 583, 584, 585, 586, 587, 588, 589, 590, &
                                      591, 592, 593, 594, 595, 596, 597, 598, 599, 600, &
                                      601, 602, 603, 604, 605 /)
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
      pht_alias_lst(:,1) = (/ 'userdefined     ', 'userdefined     ', 'userdefined     ', '                ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', '                ', '                ', '                ', &
                              '                ', 'userdefined     ', 'userdefined     ', '                ', &
                              '                ', '                ', '                ', '                ', &
                              '                ', '                ', '                ', 'userdefined     ', &
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
                              '                ', 'jsf6            ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              '                ', '                ', '                ', '                ', &
                              '                ' /)
      pht_alias_lst(:,2) = (/ '                ', '                ', '                ', '                ', &
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
                              '                ', 'jsf6            ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              'userdefined     ', 'userdefined     ', 'userdefined     ', 'userdefined     ', &
                              '                ', '                ', '                ', '                ', &
                              '                ' /)
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
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8 /)
      pht_alias_mult(:,2) = (/ 1._r8, 1._r8, 1._r8, 1._r8, 1._r8, &
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
                          1._r8, 1._r8, 1._r8, 1._r8, 1._r8 /)
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
      cph_rid(:) = (/ 402, 403, 404, 406, 407, &
                                       408, 410, 411, 412, 413, &
                                       414, 415, 416, 419, 422, &
                                       423, 424, 425, 428, 429, &
                                       430, 433, 435, 436, 437, &
                                       441, 442, 450, 451, 591, &
                                       592, 593, 594, 595, 597, &
                                       598, 599, 600, 602, 604, &
                                       605 /)
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
  integer, parameter :: vec_len = 64
  real(r8), parameter :: sol_min = 1.e-20_r8
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
    ! this source is meant for vector architectures such as the
    ! nec sx6 and cray x1
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
    real(r8), intent(in) :: reaction_rates(ncol*nlev,max(1,rxntot)) ! rxt rates (1/cm^3/s)
    real(r8), intent(in) :: extfrc(ncol*nlev,max(1,extcnt)) ! external in-situ forcing (1/cm^3/s)
    real(r8), intent(in) :: het_rates(ncol*nlev,max(1,gas_pcnst)) ! washout rates (1/s)
    real(r8), intent(inout) :: base_sol(ncol*nlev,gas_pcnst) ! species mixing ratios (vmr)
    real(r8), intent(out) :: prod_out(ncol*nlev,max(1,clscnt4))
    real(r8), intent(out) :: loss_out(ncol*nlev,max(1,clscnt4))
    !-----------------------------------------------------------------------
    ! ... local variables
    !-----------------------------------------------------------------------
    integer :: nr_iter
    integer :: ofl
    integer :: ofu
    integer :: bndx ! base index
    integer :: cndx ! class index
    integer :: pndx ! permuted class index
    integer :: m
    integer :: fail_cnt
    integer :: cut_cnt
    integer :: stp_con_cnt
    integer :: nstep
    real(r8) :: interval_done
    real(r8) :: dt
    real(r8) :: dti
    real(r8) :: max_delta(max(1,clscnt4))
    real(r8) :: sys_jac(ncol*nlev,max(1,nzcnt))
    real(r8) :: lin_jac(ncol*nlev,max(1,nzcnt))
    real(r8) :: solution(ncol*nlev,max(1,clscnt4))
    real(r8) :: forcing(ncol*nlev,max(1,clscnt4))
    real(r8) :: iter_invariant(ncol*nlev,max(1,clscnt4))
    real(r8) :: prod(ncol*nlev,max(1,clscnt4))
    real(r8) :: loss(ncol*nlev,max(1,clscnt4))
    real(r8) :: ind_prd(ncol*nlev,max(1,clscnt4))
    real(r8) :: sbase_sol(ncol*nlev,gas_pcnst)
    real(r8) :: wrk(ncol*nlev)
    logical :: convergence
    logical :: spc_conv(ncol*nlev,max(1,clscnt4))
    logical :: cls_conv(ncol*nlev)
    logical :: converged(max(1,clscnt4))
    integer :: chnkpnts ! total spatial points in chunk; ncol*ncol
    logical :: diags_out(ncol*nlev,max(1,clscnt4))
    chnkpnts = ncol*nlev
    prod_out = 0._r8
    loss_out = 0._r8
    diags_out = .false.
    !-----------------------------------------------------------------------
    ! ... class independent forcing
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
          ! ... transfer from base to class array
          !-----------------------------------------------------------------------
          do cndx = 1,clscnt4
             bndx = clsmap(cndx,4)
             pndx = permute(cndx,4)
             solution(ofl:ofu,pndx) = base_sol(ofl:ofu,bndx)
          end do
          !-----------------------------------------------------------------------
          ! ... set the iteration invariant part of the function f(y)
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
          ! ... the linear component
          !-----------------------------------------------------------------------
          if( cls_rxt_cnt(2,4) > 0 ) then
             call t_startf( 'lin_mat' )
             call linmat( ofl, ofu, chnkpnts, lin_jac, base_sol, &
                  reaction_rates, het_rates )
             call t_stopf( 'lin_mat' )
          end if
          !=======================================================================
          ! the newton-raphson iteration for f(y) = 0
          !=======================================================================
          cls_conv(ofl:ofu) = .false.
          iter_loop : do nr_iter = 1,itermax
             !-----------------------------------------------------------------------
             ! ... the non-linear component
             !-----------------------------------------------------------------------
             if( factor(nr_iter) ) then
                call t_startf( 'nln_mat' )
                call nlnmat( ofl, ofu, chnkpnts, sys_jac, base_sol, &
                     reaction_rates, lin_jac, dti )
                call t_stopf( 'nln_mat' )
                !-----------------------------------------------------------------------
                ! ... factor the "system" matrix
                !-----------------------------------------------------------------------
                call t_startf( 'lu_fac' )
                call lu_fac( ofl, ofu, chnkpnts, sys_jac )
                call t_stopf( 'lu_fac' )
             end if
             !-----------------------------------------------------------------------
             ! ... form f(y)
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
             ! ... solve for the mixing ratio at t(n+1)
             !-----------------------------------------------------------------------
             call t_startf( 'lu_slv' )
             call lu_slv( ofl, ofu, chnkpnts, sys_jac, forcing )
             call t_stopf( 'lu_slv' )
             do m = 1,clscnt4
                where( .not. cls_conv(ofl:ofu) )
                   solution(ofl:ofu,m) = solution(ofl:ofu,m) + forcing(ofl:ofu,m)
                elsewhere
                   forcing(ofl:ofu,m) = 0._r8
                endwhere
             end do
             !-----------------------------------------------------------------------
             ! ... convergence measures and test
             !-----------------------------------------------------------------------
             conv_chk : if( nr_iter > 1 ) then
                !-----------------------------------------------------------------------
                ! ... check for convergence
                !-----------------------------------------------------------------------
                do cndx = 1,clscnt4
                   pndx = permute(cndx,4)
                   bndx = clsmap(cndx,4)
                   where( abs( solution(ofl:ofu,pndx) ) > sol_min )
                      wrk(ofl:ofu) = abs( forcing(ofl:ofu,pndx)/solution(ofl:ofu,pndx) )
                   elsewhere
                      wrk(ofl:ofu) = 0._r8
                   endwhere
                   max_delta(cndx) = maxval( wrk(ofl:ofu) )
                   solution(ofl:ofu,pndx) = max( 0._r8,solution(ofl:ofu,pndx) )
                   base_sol(ofl:ofu,bndx) = solution(ofl:ofu,pndx)
                   where( abs( forcing(ofl:ofu,pndx) ) > small )
                      spc_conv(ofl:ofu,cndx) = abs(forcing(ofl:ofu,pndx)) <= epsilon(cndx)*abs(solution(ofl:ofu,pndx))
                   elsewhere
                      spc_conv(ofl:ofu,cndx) = .true.
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
                ! ... limit iterate
                !-----------------------------------------------------------------------
                do m = 1,clscnt4
                   solution(ofl:ofu,m) = max( 0._r8,solution(ofl:ofu,m) )
                end do
                !-----------------------------------------------------------------------
                ! ... transfer latest solution back to base array
                !-----------------------------------------------------------------------
                do cndx = 1,clscnt4
                   pndx = permute(cndx,4)
                   bndx = clsmap(cndx,4)
                   base_sol(ofl:ofu,bndx) = solution(ofl:ofu,pndx)
                end do
             end if conv_chk
          end do iter_loop
          !-----------------------------------------------------------------------
          ! ... check for newton-raphson convergence
          !-----------------------------------------------------------------------
          non_conv : if( .not. convergence ) then
             !-----------------------------------------------------------------------
             ! ... non-convergence
             !-----------------------------------------------------------------------
             fail_cnt = fail_cnt + 1
             nstep = get_nstep()
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
          ! ... check for interval done
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
             ! ... transfer latest solution back to base array
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
module mo_exp_sol
  private
  public :: exp_sol
  public :: exp_sol_inti
contains
  subroutine exp_sol_inti
    use mo_tracname, only : solsym
    use chem_mods, only : clscnt1, clsmap
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
    integer :: chnkpnts
    real(r8), dimension(ncol,pver,max(1,clscnt1)) :: &
         prod, &
         loss
    real(r8), dimension(ncol,pver,clscnt1) :: ind_prd
    real(r8), dimension(ncol,pver) :: wrk
    chnkpnts = ncol*pver
    !-----------------------------------------------------------------------
    ! ... Put "independent" production in the forcing
    !-----------------------------------------------------------------------
    call indprd( 1, ind_prd, clscnt1, base_sol, extfrc, &
                 reaction_rates, chnkpnts )
    !-----------------------------------------------------------------------
    ! ... Form F(y)
    !-----------------------------------------------------------------------
    call exp_prod_loss( 1, chnkpnts, prod, loss, base_sol, reaction_rates, &
                        het_rates, chnkpnts )
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
