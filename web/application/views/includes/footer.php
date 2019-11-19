<p>&nbsp;</p>
<p>&nbsp;</p>
<button onclick="topFunction()" id="myBtn" class="scroll-to-top" title="Scroll to the top"><i class="fa fa-chevron-up"></i></button>
<style>

.scroll-to-top {

    display: none;
    position: fixed;
    right: 35px;
    bottom: 35px;
    font-size: 1.15em;
    height: 40px;
    width: 40px;
    background: rgba(152, 155, 160) ;
    line-height: 38px;
    color: #ffffff;
    z-index: 99;
    text-align: center;
    opacity: .3;
    cursor: pointer;
    -webkit-transition: all .25s ease;
    -moz-transition: all .25s ease;
    -ms-transition: all .25s ease;
    -o-transition: all .25s ease;
    transition: all .25s ease;
}
@media(max-width:768px){
  .scroll-to-top {
    right: 20px;
    bottom: 20px;
    font-size: 1.10em;
    height: 30px;
    width: 30px;
    line-height: 18px;
  }
}
</style>


<script>
  // When the user scrolls down 20px from the top of the document, show the button
  window.onscroll = function() {scrollFunction()};

  function scrollFunction() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          document.getElementById("myBtn").style.display = "block";
      } else {
          document.getElementById("myBtn").style.display = "none";
      }
  }

  // When the user clicks on the button, scroll to the top of the document
  function topFunction() {
       $('body,html').animate({
          scrollTop : 0
      }, 500);
  }

</script>
<!-- BEGINNING OF FOOTER -->
<div class="buzen-footer" id="contact-us">
 <div class="container">
    <div class="row">
    <div class="col-md-4 col-lg-4">
      <h4>AirQo</h4>
      <?php
      foreach ($contact as $row) {
      ?>
      <p><?=$row['con_address'];?></p>
      <?php }?>
    </div>
    <div class="col-md-4 col-lg-4"></div>
    <div class="col-md-4 col-lg-4">
      <h4>Subscribe to our newsletter</h4>
      <p>Recieve our most important news by email</p>

      <form method="post"  action="<?php echo site_url('Airqo/visitorEmail');?>">
        <input type="email" class="form-control" name="email" placeholder="Enter your email address" required />
        <button type="submit" name="submit" value="Send Message" class="btn btn-default push-right"><i class="fa fa-envelope"></i></button>
      </form>
    </div>
  </div>
 </div>
 <hr/>
 <div class="container-fluid">
   <div class="row">
     <div class="col-lg-8 col-md-8"></div>
     <div class="col-lg-4 col-md-4">
      
       &copy; <?php echo date("Y");?> AirQo | Designed by <a href="http://buzentechnologies.com" target="_blank" style="color: #fff;" nofollow>Buzen Technologies Co. Ltd</a>
     </div>
   </div>
 </div>
</div>

  <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="<?php echo base_url();?>assets/bootstrap/js/jquery-2.1.4.min.js"></script>
    <script src="<?php echo base_url();?>assets/bootstrap/js/popper.min.js"></script>
    <script src="<?php echo base_url();?>assets/bootstrap/js/bootstrap.min.js"></script>

    <script src="<?php echo base_url();?>assets/bootstrap/js/wow.min.js"></script>
    <script>new WOW().init();</script>

    <!-- animated scroll -->
    <script type="text/javascript" src="<?php echo base_url();?>assets/scroll animation/jquery.localScroll.min.js"></script>
    <script type="text/javascript" src="<?php echo base_url();?>assets/scroll animation/jquery.scrollTo.min.js"></script>
    <!-- animated scroll inntialisation -->
     <script type="text/javascript">
        $(document).ready(function(){
          $('#myNav').localScroll({duration:800});
          $('#myNav0').localScroll({duration:800});
        });

    </script>
  </body>
</html>
