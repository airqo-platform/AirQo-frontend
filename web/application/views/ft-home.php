<?php
//Retrive single random node to show graph and map
$get_random_node = $this->db->query("SELECT * FROM tbl_app_nodes ORDER BY RAND() LIMIT 1");
$node = $get_random_node->row_array();
$node_color = $this->AirqoModel->nodestate($node['reading'])['node_color'];
$node_caption = $this->AirqoModel->nodestate($node['reading'])['node_caption'];
$random_node = '
     <div class="col-md-3 col-lg-3 col-xs-12 col-sm-12">
          <div class="panel panel-danger" style="background: '.$node_color.';">
               <i class="fa fa-frown-o"></i>
               <h4>'.$node['an_name'].'</h4>
               <h6>'.$node['an_map_address'].'</h6>
               <h4>'.$node['reading'].'</h4>
               <h4>PM 2.5</h4>
               <h5>'.$node_caption.'</h5>
          </div>
     </div>';
?>
     <!--buzen-logo-->
     <div class="buzen-logo" id="buzen-logo">
          <div class="container">
               <div class="row">

                    <div class="col-sm-12 col-md-12 col-lg-12">
                         <form method="POST" action="#">
                              <input type="text" id="search-value" name="search" class="form-control" placeholder="Your town, City, District..." required>
                              <button class="btn btn-default pull-right" name="submit"> <i class="fa fa-search"></i> </button>
                         </form>
                         <br>
                         <div class="list-group hide" id="search-results">
                              
                         </div>
                    </div>

               </div>
          </div>
     </div>
     <!--buzen-logo-->

     <!-- END OF HEADER INFO -->
     <!-- start of the body section -->
     <!--    header-->
     <div class="buzen-header">
          <div class="container">
               <div class="row">
                    <p class="top-header"> <b> Understand the state </b> <br /> <span>of the air quality around you</span></p>
               </div>
          </div>
     </div>
     <!--    end of header-->

     <!-- cards section -->
     <div class="buzen-card-section" id="buzen-card-section">
          <div class="container">
               <div class="row">
                    <?php 
                    $get_nodes     = $this->db->query("SELECT * FROM tbl_app_nodes ORDER BY RAND() LIMIT 3");
                    $appnodes      = $get_nodes->result_array();
                    foreach ($appnodes as $node) {
                         $node_color    = $this->AirqoModel->nodestate($node['reading'])['node_color'];
                         $node_caption  = $this->AirqoModel->nodestate($node['reading'])['node_caption'];
                         ?>
                         <div class="col-md-4 col-lg-4 col-sm-6 col-xs-12">
                              <div class="panel panel-default">
                                   <center>
                                        <h4><?= $node['an_name']; ?></h4><br />
                                        <h6><?= $node['an_map_address']; ?></h6>
                                   </center>
                                   <div class="row">
                                        <div class="col-md-4 col-lg-4 col-sm-4 col-xs-6">
                                             <div class="panel panel-primary " style="background: <?= $node_color; ?>;">
                                                  <i class="fa fa-frown-o"></i>
                                             </div>
                                        </div>
                                        <div class="col-md-8 col-lg-8 col-sm-8 col-xs-6">
                                             <div class="panel panel-success" style="background:<?= $node_color; ?>;">
                                                  <div class="row">
                                                       <div class="col-md-5 col-sm-5">
                                                            <h3><?= $node['reading']; ?></h3>
                                                            <h5>PM 2.5</h5>
                                                       </div>
                                                       <div class="col-lg-7 col-sm-7">
                                                            <h4><?= $node_caption; ?> </h4>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <?php
                    }
                    ?>

               </div>
          </div>
     </div>
     <!-- End of the cards section -->
     <!--Map Section-->
     <div class="buzen-map" id="buzen-map">
          <div class="container">
               <div class="panel panel-default">
                    <div class="row">
                         <?= $random_node; ?>
                         <div class="col-md-4 col-lg-4 col-xs-12 col-sm-12">
                              <h2 class="text-center"></h2>
                              <div id="hchart" style="width:100%; height:300px;">
                              </div>
                         </div>
                         <div class="col-md-5 col-lg-5 col-xs-12 col-sm-12">
                              <div class="buzen-map-section">
                                   <iframe src="https://maps.google.com/maps?width=700&amp;height=440&amp;hl=en&amp;q=uganda+(uganda)&amp;ie=UTF8&amp;t=&amp;z=10&amp;iwloc=B&amp;output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
                                   <div style="position: absolute;width: 80%;bottom: 20px;left: 0;right: 0;margin-left: auto;margin-right: auto;color: #000;"><small style="line-height: 1.8;font-size: 8px;background: #fff;"><a href="https://embedgooglemaps.com/"></a></small></div>
                                   <style>
                                        #gmap_canvas img {
                                             max-width: none !important;
                                             background: none !important
                                        }
                                   </style>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     </div>
     <!--end of map section-->