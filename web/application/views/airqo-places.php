<!-- cards section -->
<div class="buzen-card-section from-top" id="buzen-card-section">
     <div class="container">
          <div class="row">

               <!-- Know your air header -->
               <div class="col-md-8 col-lg-8 col-sm-8 col-xs-12">
                    <div class="buzen-header">
                         <h4><b>Know your air</b></h4>
                         <h5>AirQo is the leading air quality data monitoring, analysis and modelling platform in East Africa. Collaborate with us as we use data to achieve clean air for all African cities</h5>
                    </div>
               </div>
               <!-- End of know your air header -->

               <!-- Search field -->
               <div class="col-md-4 col-lg-4 col-sm-4 col-xs-12">
                    <div class="buzen-logo" id="buzen-logo">
                         <div class="container">
                              <div class="row">
                                   <div class="">
                                        <form method="POST" action="#">
                                             <input type="text" id="search-value" name="search" class="form-control" placeholder="Your town, City, District..." required>
                                             <button class="btn btn-default " name="submit"> <i class="fa fa-search"></i> </button>
                                        </form>
                                        <div style="position:relative; z-index: 999;">
                                             <div class="hide" id="search-results" style="position:absolute; overflow-x: hidden; height: 200px;"></div> 
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
               <!-- End of search field -->

          </div>
     </div>

     <div class="container">
          <div class="row">
               <?php
               $get_nodes     = $this->db->query("SELECT * FROM tbl_app_nodes 
                                                       WHERE an_deleted = '0' 
                                                       AND an_active = '1' 
                                                       ORDER BY RAND()");
               $appnodes      = $get_nodes->result_array();
               foreach ($appnodes as $node) {
                    $node_color    = $this->AirqoModel->nodestate($node['reading'])['node_color'];
                    $node_caption  = $this->AirqoModel->nodestate($node['reading'])['node_caption'];
                    ?>
                         <div class="col-md-4 col-lg-4 col-sm-6 col-xs-12" style="cursor: pointer;" onclick="window.location='<?= site_url('node/' . $node['an_channel_id']); ?>'">
                              <div class="panel panel-default">
                                   <center>
                                        <h4><a href="<?= site_url('node/' . $node['an_channel_id']); ?>"><?= $node['an_name']; ?></a></h4><br />
                                        <h6><?= $node['an_map_address']; ?></h6>
                                   </center>
                                   <div class="row">
                                        <div class="col-md-4 col-lg-4 col-sm-4 col-xs-6">
                                             <div class="panel panel-primary " style="background: <?= $node_color; ?>;">
                                                  <i class="fa fa-frown-o"></i>
                                             </div>
                                        </div>
                                        <div class="col-md-8 col-lg-8 col-sm-8 col-xs-6">
                                             <div class="panel panel-success" style="background: <?= $node_color; ?>;">
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