<?php

    class Commodity{
        private $name="";
        private $address="";
        private $photo=[];
        
        public function __construct() {
            
        }
        
        public function setName($commodityName){
            $this->name=$commodityName;
        }
        
        public function getName(){
            return $this->name;
        }
        
        public function setAddress($commodityAddress){
            $this->address=$commodityAddress;
        }
        
        public function getAddress(){
            return $this->address;
        }
        
        public function setPhotos($commodityPhotos){
            // TODO 
            $this->photo=split(" ", $commodityPhotos);
        }
        
        public function getPhotos(){
            return $this->photo;
        }
    }
    
    class CommodityDescription{
        /**
         *
         * @var type String, name of commodity
         */
        public $name;
        /**
         *
         * @var type String, description of commodity
         */
        public $description;
        /**
         *
         * @var type String, name of category, which belong to ( if exists )
         */
        public $categoryName;
    }
    
    class Connection {
        private static $host="localhost";
        private static $user="root"; 
        private static $password="root"; 
        private static $databaseName="zurich"; 
        private static $charset="utf8";
        private static $connection;
        
        /**
         * one point for connect to 
         * @return type
         */
        public static function getConnection (){
            if(Connection::$connection == null){
                Connection::$connection=mysql_connect(Connection::$host, Connection::$user, Connection::$password) or die("could not connect");
                mysql_set_charset(Connection::$charset);
                mysql_select_db(Connection::$databaseName);
            }
            return Connection::$connection;
        }
        
    }
    
    $id=$_REQUEST["id"];
    if($id!=NULL){
        // fetch data:
        $connection=Connection::getConnection();
        $id=mysql_real_escape_string(strtolower($id));
        
        // fetch data. main description
        $queryCommodity="SELECT name, address, photo FROM Point WHERE lower(svg_id) LIKE  '$id'";
        $sqlResultCommodity = mysql_query($queryCommodity, $connection);
        $resultCommodity=new Commodity();
        if(mysql_num_rows($sqlResultCommodity)==1){
            $row=mysql_fetch_array($sqlResultCommodity);
            $rowName=$row["name"];
            $resultCommodity->setName($rowName);
            $rowAddress=$row["address"];
            $resultCommodity->setAddress($rowAddress);
            $rowPhoto=$row["photo"];
            $resultCommodity->setPhotos($rowPhoto);
        }else{
            echo "not found";
        }
        mysql_free_result($sqlResultCommodity);
                
        // fetch data. commodity description
        $queryCommodityDescription="select c.name name, cat.name category_name, c.description description from Point p \n".
        "inner join Point2commodity pc on pc.point_id=p.id \n".
        "inner join Commodity c on c.id=pc.commodity_id \n".
        "left join Category cat on cat.id=c.category_id \n".
        "where lower(svg_id) like '$id'";
        
        $sqlResultCommodityDescription = mysql_query($queryCommodityDescription, $connection);
        $resultCommodityDescriptions=array();
        while($rowDescription=mysql_fetch_array($sqlResultCommodityDescription)){
            $eachDescription=new CommodityDescription();
            $tempName=$rowDescription["name"];
            $eachDescription->name=$tempName;
            $tempCategoryName=$rowDescription["category_name"];
            $eachDescription->categoryName=$tempCategoryName;
            $tempDescription=$rowDescription["description"];
            $eachDescription->description=$tempDescription;
            // echo $eachDescription->categoryName +  " <br />";
            // echo $eachDescription->description +  " <br />";
            // echo $eachDescription->categoryName."".$eachDescription->name."".$eachDescription->description;
            array_push($resultCommodityDescriptions,$eachDescription);
        }
        mysql_free_result($sqlResultCommodityDescription);

        // output: resultCommodity, resultCommodityDescription
        
        // echo $resultCommodity->getName()+", "+$resultCommodity->getAddress()+",  "+$resultCommodity->getPhoto()+"<br />";
        $tempName=$resultCommodity->getName();
        $tempAddress=$resultCommodity->getAddress();
        $tempPhotos=$resultCommodity->getPhotos();
        
        echo "<b> Point data: </b>  $tempName : $tempAddress ";
        $index=0;
        for($index=0;$index<count($tempPhotos);$index=$index+1){
            echo $tempPhotos[$index];
        }
        echo " <hr /> Descriptions <br />";
        for($index=0;$index<count($resultCommodityDescriptions);$index=$index+1){
            $currentDescription=(object)$resultCommodityDescriptions[$index];
            // var_dump($currentDescription); echo "<br />";
            echo "Name: ".$currentDescription->name." <br /> ";
            echo "CategoryName: ".$currentDescription->categoryName." <br /> ";
            echo "Description: ".$currentDescription->description." <br />";
            echo ". . . <br />";
        }
        
    }else{
        echo "check input values : $id";
    }
    
?>