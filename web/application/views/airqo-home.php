<!-- start of sent email response section -->
<style type="text/css">
  .sent-message-response{
    margin:40px;
    position: absolute;
    top: 200px;
    left: 3%;
    z-index: 200;
  }
  .sent-message-response .alert-success{
    border-radius: 0px;
  }

</style>
<div class="sent-message-response">
  <div class="container">
    <?php
    if($this->session->flashdata('error'))
    {
      echo '<p class="alert alert-danger" style="text-align:center;">
      <button class="close" data-close="alert"></button><span> '.$this->session->flashdata('error').'</span></div>';


    }
    if($this->session->flashdata('msg'))
    {
      echo '<p class="alert alert-success" style="text-align:center;">
      <button class="close" data-close="alert"></button><span > <i class="fa fa-check"></i> '.$this->session->flashdata('msg').'</span></div>';
    }
  ?>
  </div>
    
</div>
<!-- end of sent email response section -->

<div class="home-image">
  <img src="<?= base_url();?>assets/images/home/wind_vane.jpg" width="100%" height="600px">
  <div class="right-slider">
    <div class="row">
      <div class="col col-lg-6 col-md-6">
        
      </div>
      <div class="col col-lg-6 col-md-6">
        <!-- carousel -->
        <div class="carousel slide" data-ride="carousel"  data-interval="4000">
              <!-- Indicators -->
              <ol class="carousel-indicators">
                <li data-target="#carousel-example-generic" data-slide-to="0" class="active"></li>
                <li data-target="#carousel-example-generic" data-slide-to="1"></li>
                <li data-target="#carousel-example-generic" data-slide-to="2"></li>
              </ol>

              <!-- Wrapper for slides -->
              <div class="appstore">
                <div class="col col-lg-6 col-md-6 pull-right">
                  <a href="https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8" target="_blank">
                   <img class="left" src="<?= base_url();?>assets/images/home/appstore.png" width="150px" height="45px">
                  </a>
                </div>
                <div class="col col-lg-6 col-md-6 pull-left">
                  <a href="https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp" target="_blank">
                   <img class="right" src="<?= base_url();?>assets/images/home/playstore.png" width="150px" height="45px">
                  </a>
                </div>
              </div>
              <div class="  car carousel-inner" role="listbox">
                <div class="item active blue" >
                  <div class="carousel-caption blue">
                         <h3>Understand the state of air quality around Kampala</h3>
                  </div>
                </div>
                <div class="item blue" >
                  <div class="carousel-caption blue">
                         <h3>Fine-grained and Real-time Air Quality Data</h3>
                  </div>
                </div>
                <div class="item blue" >
                  <div class="carousel-caption blue">
                         <h3>Know which places to avoid around you in Kampala</h3>
                  </div>
                </div>
                
              </div>

              <!-- Controls -->
              <a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
                <span><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></span>
                <span class="sr-only">Previous</span>
              </a>
              <a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
                <span><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></span>
                <span class="sr-only">Next</span>
              </a>
        </div>
      </div>
    </div>
  </div>
</div>
<p>&nbsp;</p>
<div class="buzen-current-projects">

  <div class="container">
    <div class="project-big-tile">
    <div class="row " style="padding: 0px 20px;">
      <div class="col col-md-10 col-lg-10 col-sm-10 col-xs-10">
        <h3 class="align-myTitle">Current Projects</h3>
      </div>
       <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2">
          <div class="icons">
            <div class="row">
               <a href="#" class="col col-sm-8 col-xs-8" title="Recent Projects"><i class="fa fa-th" id="large"></i></a>
               <a href="<?= site_url('projects')?>" class="col col-sm-4 col-xs-4" title="See All"><i class="fa fa-external-link" id="list"></i></a>
            </div>
           
          </div>
        </div>
    </div>
    
    <div class="myrow">
      <div class="row row-centered">
        <div class="col-lg-8 col-md-8 col-xs-12 col-sm-12 col-centered">
           <?php
              foreach ($projectFirst as $row) {
            ?>
          <a href="<?= site_url('project/'.$row['p_slug'].'');?>">
            
            <div class="image-section">
              <img src="<?= base_url();?>assets/images/projects/<?=$row['p_image'];?>" width="100%" height="250px">
            </div>                                
            <div class="text-section">
              <h4><?=$row['p_title'];?></h4>
            </div>
          </a>
          <?php }?>
        </div>
         <?php
            foreach ($projectSecond as $row) {
          ?>
        <div class="col-lg-4 col-md-4 col-xs-12 col-sm-12 col-centered">
          <a href="<?= site_url('project/'.$row['p_slug'].'');?>">
            <div class="image-section">
              <img src="<?= base_url();?>assets/images/projects/<?=$row['p_image'];?>" width="100%" height="250px">
            </div>
            <div class="text-section">
              <h4><?=$row['p_title'];?></h4>
            </div>
          </a>
        </div>
         <?php }?>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- end of the buzen current projects section -->
<p>&nbsp;</p>
<div class="buzen-app-section">
   <div class="container">
     <div class="row">
      <div class="col-lg-1 col-md-1 col-sm-12 col-xs-12"></div>
       <div class="col-lg-5 col-md-5 col-sm-12 col-xs-12">
         <h3>Download the app</h3>
         <p>With over 2 million records per year of air quality data around Kampala, AirQo has the largest dataset about the state of air quality around Kampala.</p>

		<p>Our AirQo Apps provide you with real-time insights on the state of air quality around you</p>
         <br/>
          <div class="downloads">
            <div class="row">
              <div class="col col-md-6 col-lg-6">
                <a href="https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8" target="_blank">
                   <img src="<?= base_url();?>assets/images/home/appstore_icon.png" height="40px" width="130px">
                </a>
              </div>
              <div class="col col-md-6 col-lg-6 ">
                 <a href="https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp" target="_blank">
                   <img class="left" src="<?= base_url();?>assets/images/home/android_dl.png" height="40px" width="130px">
                 </a>
              </div>
            </div>
          </div>
       </div>
       <div class="col-lg-5 col-md-5 col-sm-12 col-xs-12">
          <div class="myimage">
             <img class="" src="<?= base_url();?>assets/images/home/app_shots.png" height="300px" width="400px">
          </div>
       </div>
      <div class="col-lg-1 col-md-1 col-sm-12 col-xs-12"></div>

     </div>
   </div>
</div>
<p>&nbsp;</p>
<div class="buzen-airqo-partners">
  <div class="container">
    <div class="partner-tile">
    <div class="row">
      <div class="col-md-3"></div>
      <div class="col-md-6 col-lg-6">
        <h3 style="text-align:center;">Our Partners</h3>
         <p>The AirQo project aims to measure and quantify the scale of air pollution in and around Kampala City through the design, development and deployment of a network of low-cost air quality sensing devices mounted on either static or mobile objects.</p>
      </div>
      <div class="col-md-3"></div>
    </div>
   
    <div class="row">
	    <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/muk.jpg" height="150px" width="200px">
        </div>
      </div>
      
      <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/kcca.png" height="150px" width="200px">
        </div>
      </div>
      <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/sheffield.jpg" height="150px" width="200px">
        </div>
      </div>
      <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/development.jpg" height="150px" width="200px">
        </div>
      </div>
    </div>
	
	<div class="row">
	 <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/nema.jpg" height="150px" width="200px">
        </div>
      </div>
      <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/observatory.jpg" height="150px" width="200px">
        </div>
      </div>
      <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/buzen_tech.png" height="150px" width="200px">
        </div>
      </div>

      <div class="col-lg-3 col-md-3 col-xs-12 col-sm-12">
        <div class="image-class">
          <img src="<?= base_url();?>assets/images/home/bodabodas.jpg" height="150px" width="200px">
        </div>
      </div>
    </div>
  </div>
 </div>
</div>
<script type="text/javascript">
    setTimeout(function() {
      $('.alert').fadeOut('fast');
    }, 3000);
</script>