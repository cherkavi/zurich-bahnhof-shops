<?php

    /** one item from Database */
    class Item{
        public $id;
        public $title;
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
    
    $mode=$_REQUEST["mode"];
    $searchText=$_REQUEST["text"];
    if($mode!=NULL && $searchText!=NULL){
        if(strcmp($mode, "point")==0){
            // http://localhost/HtmlZurich/php/descriptionFinder.php?mode=point&text=orange
                
            $connection=Connection::getConnection();

            $searchText=mysql_real_escape_string(strtolower($searchText));
            $query="SELECT svg_id, name FROM Point WHERE LOWER( name ) LIKE  '%$searchText%'";

            $returnValue=[];
            $result = mysql_query($query, $connection);
            while ($row = mysql_fetch_array($result)) {
                $newItem=new Item();
                $newItem->id=$row["svg_id"];
                $newItem->title=$row["name"];
                array_push($returnValue, $newItem );
            }
            echo json_encode($returnValue);
            mysql_free_result($result);
        } else 
        if($mode=="commodity"){
            // http://localhost/HtmlZurich/php/descriptionFinder.php?mode=commodity&text=%D0%BA%D0%B5%D0%BF%D0%BA
            
            $connection=Connection::getConnection();

            $searchText=mysql_real_escape_string(strtolower($searchText));
            
            $query="SELECT p.svg_id svg_id, p.name name FROM Point p \n".
            "inner join Point2commodity pc on pc.point_id=p.id \n".
            "inner join Commodity c on c.id=pc.commodity_id and lower(c.name) like '%$searchText%'";
            
            $returnValue=[];
            $result = mysql_query($query, $connection);
            while ($row = mysql_fetch_array($result)) {
                $newItem=new Item();
                $newItem->id=$row["svg_id"];
                $newItem->title=$row["name"];
                array_push($returnValue, $newItem );
            }
            echo json_encode($returnValue);
            mysql_free_result($result);
            
        } else{
            echo "check mode: $mode";
        }
    }else{
        echo "check input values : $mode   $searchText";
    }
    
?>