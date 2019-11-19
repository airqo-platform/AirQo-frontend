<?php 
$contact = $this->AirqoModel->get_contact_details(1);
?>
<!-- End of the maps section -->
     <!--back to top funtion-->
     <a href="#0" class="cd-top"></a>
     <!--back to top funtion-->
     <!-- BEGINNING OF FOOTER -->
     <div class="buzen-footer" id="contact-us">
          <div class="container">
               <div class="row">
                    <div class="col-sm-3 col-md-3 col-lg-3">
                         <h4>AirQo</h4>
                         <?= $contact['con_address']; ?>
                         <p><br /></p>
                    </div>
                    <div class="col-sm-3 col-md-3 col-lg-3">
                         <h4>Explore</h4><br />
                         <ul class="nav">
                              <li><a href="<?= site_url('airqo/news'); ?>">News</a></li>
                              <li><a href="<?= site_url('airqo/projects'); ?>">Projects</a></li>
                              <li><a href="<?= site_url('/'); ?>">Get Involved</a></li>
                              <li><a href="<?= site_url('/'); ?>">Apps</a></li>
                         </ul>
                    </div>

                    <div class="col-sm-3 col-md-3 col-lg-3">
                         <h4>About</h4>
                         <ul class="nav">
                              <li><a href="<?= site_url('airqo/about'); ?>">About Us</a></li>
                              <li><a href="<?= site_url('airqo/howItWorks'); ?>">How it Works</a></li>
                              <li><a href="<?= site_url('airqo/team'); ?>">Team</a></li>
                              <li><a href="<?= site_url('airqo/faqs'); ?>">Faqs</a></li>
                         </ul>
                    </div>
                    <div class="col-sm-3 col-md-3 col-lg-3">
                         <h4>subscribe to our newsletter</h4>
                         <p>Recieve our Latest updates via email</p>
                         <form method="post" action="#">
                              <input type="email" class="form-control" name="email" placeholder="Enter your email address" required />
                              <button type="submit" name="submit" value="Send Message" class="btn btn-default push-right"><i class="fa fa-envelope"></i></button>
                         </form>
                    </div>
               </div>
          </div>
          <hr />
          <div class="container-fluid">
               <div class="row">
                    <div class="col-lg-12 col-md-12">
                         <center>
                              &copy; <?php echo date("Y"); ?> AirQo
                         </center>
                    </div>
               </div>
          </div>
     </div>
     <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
     <script src="<?= base_url(); ?>assets/frontend/js/jquery-1.11.1.min.js"></script>
     <script src="<?= base_url(); ?>assets/frontend/js/BackToTop.js"></script>
     <script>
          // Select all links with hashes
          $('a[href*="#"]')
               // Remove links that don't actually link to anything
               .not('[href="#"]')
               .not('[href="#0"]')
               .click(function(event) {
                    // On-page links
                    if (
                         location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
                         location.hostname == this.hostname
                    ) {
                         // Figure out element to scroll to
                         var target = $(this.hash);
                         target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                         // Does a scroll target exist?
                         if (target.length) {
                              // Only prevent default if animation is actually gonna happen
                              event.preventDefault();
                              $('html, body').animate({
                                   scrollTop: target.offset().top
                              }, 1000, function() {
                                   // Callback after animation
                                   // Must change focus!
                                   var $target = $(target);
                                   $target.focus();
                                   if ($target.is(":focus")) { // Checking if the target was focused
                                        return false;
                                   } else {
                                        $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                                        $target.focus(); // Set focus again
                                   };
                              });
                         }
                    }
               });
     </script>
     <script src="https://code.highcharts.com/highcharts.js"></script>
     <script type="text/javascript">
          // Highcharts.chart('mg', {
          //      data: {
          //           table: 'datatable'
          //      },
          //      chart: {
          //           type: 'column'
          //      },
          //      title: {
          //           text: 'Air Quality History'
          //      },
          //      yAxis: {
          //           allowDecimals: false,
          //           title: {
          //                text: 'Weather Conditions'
          //           }
          //      },
          //      tooltip: {
          //           formatter: function() {
          //                return '<b>' + this.series.name + '</b><br/>' +
          //                     this.point.y + ' ' + this.point.name.toLowerCase();
          //           }
          //      }
          // });

          Highcharts.chart('hchart', {
               chart: {
                    type: 'column'
               },
               title: {
                    text: 'Air Quality'
               },
               subtitle: {
                    text: 'Source: airqo.net'
               },
               xAxis: {
                    categories: [
                         '12:00',
                         '13:00',
                         '14:00',
                         '15:00',
                         '16:00',
                         '17:00',
                         '18:00',
                         '19:00',
                         '20:00',
                         '21:00',
                         '22:00',
                         '23:00'
                    ],
                    crosshair: true
               },
               yAxis: {
                    min: 0,
                    title: {
                         text: 'PM 2.5'
                    }
               },
               tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                         '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
               },
               plotOptions: {
                    column: {
                         pointPadding: 0.2,
                         borderWidth: 0
                    }
               },
               series: [{
                    name: 'Airqo',
                    data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

               }]
               });
     </script>
     <!-- Include all compiled plugins (below), or include individual files as needed -->
     <script src="<?= base_url(); ?>assets/frontend/js/bootstrap.min.js"></script>

     <script type="text/javascript">
          $('#search-value').keyup(function (e) { 
               e.preventDefault();
               var searchKey = $('#search-value').val();
               if(searchKey.length >= 3) {
                    $.ajax({
                         type: "POST",
                         url: "<?= site_url('node-search'); ?>",
                         data: {
                              searchkey : searchKey
                         },
                         dataType: "json",
                         success: function (response) {
                              var success = response.success;
                              if(success == 1) {
                                   $('#search-results').html(response.searchresults);
                              } else {

                              }
                         }
                    });
                    $('#search-results').removeClass('hide');
               } else {
                    $('#search-results').addClass('hide');
               }
          });
     </script>
</body>
</html>