<?php
/* HTML parser
	 Extract parts of the index html file, based on elements (ex. code, id)
*/
error_reporting(E_ALL & ~E_NOTICE);
include('simple_html_dom.php');
$tag  = (isset($_GET['tag'])) ? $_GET['tag'] : "carriers"; //by default show daily cases
$lang = (isset($_GET['lang'])) ? $_GET['lang'] : "gr";		 //b.d show greek version
$by = (isset($_GET['by'])) ? $_GET['by'] : "code";				 //b.d select code elements
$file = ($lang == 'en') ? '_en' : "";
$source_txt = ($lang == "gr") ? "Πηγή" : "Source";

function getBodyContent($doc, $elem)
{
		global $lang,$by,$source_txt;
		$html = new simple_html_dom();
		$html->load_file($doc);
		$code = "";
		if ($html->find('html') || $html->find('body')) {
			//Remove popup window (not required)
			foreach($html->find('div=[class="embedwin"]') as $ele_remov){
			    $ele_remov->outertext = '';
			    $html->save();
			}
			//Replace Source
	    foreach($html->find('p=[class="notes"]') as $line){
	        $line->innertext = $source_txt.': <a href="https://covid19-greece.tk" target="_blank">covid19-greece</a>';
	        $html->save();
	    }
	    //Get content by $by variable
			foreach($html->find("div=[$by='".$elem."']") as $a){
				if(isset($a))
		    {
		    	$code = $a->outertext;
		    	break; //Always get the first occurence only
		  	}
	  	}
  	}
  	return $code;
}
?>
<!doctype html>
<html class="no-js" lang="<?php echo $lang;?>">
<head>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1,user-scalable=no">
<meta name="format-detection" content="telephone=no">
<meta property="og:url" content="https://covid19-greece.tk" />
<meta property="og:image" content="https://covid19-greece.tk/img/site_s.jpg" />
<meta property="og:type" content="article" />
<meta property="og:title" content="Αναφορά κατάστασης για την νόσο του Κορωνοϊού (COVID-19) στην Ελλάδα" />
<meta property="og:description" content="Επιβεβαιωμένα κρούσματα COVID-19 στην Ελλάδα. Τα στοιχεία παρέχονται από το Υπουργείο Υγείας." />
<meta name="twitter:card" content="summary_large_image" />
<title>Coronavirus Disease (COVID-19) Situation Report in Greece</title>
<link rel="shortcut icon" href="../favicon.ico" type="image/x-icon">
<link rel="icon" href="favicon.ico" type="image/x-icon">
<link href="https://fonts.googleapis.com/css?family=Noto+Sans+JP|Roboto&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css">
<link rel="stylesheet" href="../css/reset.css"/>
<link rel="stylesheet" href="../css/modal.css"/>
<link rel="stylesheet" href="../css/style.css"/>
<link rel="stylesheet" href="../css/stylebars.css"/>
<link rel="stylesheet" href="../css/table.css"/>
<link rel="stylesheet" href="../css/jquery.tablesorter/theme.blackice.min.css">
<link rel="stylesheet" href="../css/simptip.min.css"/>
<link rel="stylesheet" href="../lib/katex.min.css">	
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
<link href="../lib/mapsvg/css/mapsvg.css" rel="stylesheet">
<link href="../lib/mapsvg/css/nanoscroller.css" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-sparklines/2.1.2/jquery.sparkline.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
<script src="../lib/auto-render.min.js"></script>
<script src="../lib/katex.min.js"></script>
<script src="../js/jquery.hoverIntent.min.js"></script>
<script type="text/javascript" src="../js/jquery.tablesorter/jquery.tablesorter.min.js"></script>
<script type="text/javascript" src="../js/jquery.tablesorter/jquery.tablesorter.widgets.min.js"></script>
<script src="https://code.highcharts.com/maps/highmaps.js"></script>
<script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
<script src="https://code.highcharts.com/mapdata/countries/gr/gr-all.js"></script>
<script src="../js/dark.js"></script>
<script src="../js/script.min.js?version=4"></script>
<script src="../lib/mapsvg/js/jquery.mousewheel.min.js"></script>
<script src="../lib/mapsvg/js/jquery.nanoscroller.min.js"></script>
<script src="../lib/mapsvg/js/mapsvg.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script> 
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-174177919-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-174177919-1');
</script>
<style>
	#greece-map {
	    height: 500px; 
	    min-width: 310px; 
	    max-width: 800px; 
	    margin: 0 auto; 
	}
	.highcharts-credits {
    font-size: 9px!important;
	}
	/* Overwrites */
	#container {
	  overflow-x: hidden;
	  transition: all ease 300ms;
	  padding: 0!important; 
	}
	#container #main-block .box {
	  position: relative;
	  margin: 0!important; 
	  width: 100%!important;
	  padding: 8px 8px;
	  background-color: #242a3c;
	  border: none;
	  border-radius: 4px; 
	}
</style>
</head>
  <body>
  <div id="container">
    <div id="main-block">
			<?php echo getBodyContent("../index".$file.".html", $tag);?>
  	</div>
  </div>	
</body>
</html>
