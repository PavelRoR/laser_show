<?php  
// $strTo = "remontufa24@yandex.ru";
$strTo = "pavelvp2182@yandex.ru";
$strSubject = "Заявка с сайта 'Лазерное шоу'";
$strMessage = nl2br($_POST["txtDescription"]);  
$info = array();
//*** Uniqid Session ***//  
$strSid = md5(uniqid(time()));  

$strHeader = "";
$strHeader .= "Телефон: ".$_POST["txtDescription"]."";  

////$strHeader .= "MIME-Version: 1.0\n";  
////$strHeader .= "Content-Type: multipart/mixed; boundary=\"".$strSid."\"\n\n";  
//$strHeader .= "This is a multi-part message in MIME format.\n";  
//  
//$strHeader .= "--".$strSid."\n";  
//$strHeader .= "Content-type: text/html; charset=utf-8\n";  
//$strHeader .= "Content-Transfer-Encoding: 7bit\n\n";  
//$strHeader .= $strMessage."\n\n";  

//*** Attachment ***//  
//if($_FILES["fileAttach"]["name"] != "")  
//{  
//$strFilesName = $_FILES["fileAttach"]["name"];  
//$strContent = chunk_split(base64_encode(file_get_contents($_FILES["fileAttach"]["tmp_name"])));  
//$strHeader .= "--".$strSid."\n";  
//$strHeader .= "Content-Type: application/octet-stream; name=\"".$strFilesName."\"\n";  
//$strHeader .= "Content-Transfer-Encoding: base64\n";  
//$strHeader .= "Content-Disposition: attachment; filename=\"".$strFilesName."\"\n\n";  
//$strHeader .= $strContent."\n\n";  
//}

$flgSend = @mail($strTo,$strSubject,$strHeader);  // @ = No Show Error //  

if($flgSend)  
{  
echo "";  
    
}  
else  
{  
echo "Возникла ошибка! Данные не получены";  
}  
ini_set('short_open_tag', 'On');
header('Refresh: 5; URL=http://www.zvukufa.ru/version_2');
?>
    <!DOCTYPE html>
    <html lang="ru-RU">

    <head>
        <meta charset="UTF-8">
        <title>Спасибо</title>
        <link rel="stylesheet" href="css/styles.css" />
    </head>

    <body>
        <section  id="container-thanks">
            <div class="container">
                <div class="order">
                    <p>Мы получили Ваш номер телефона и скоро свяжемся с Вами!</p>
                    <p>Хорошего Вам дня!</p>
                </div>
            </div>
        </section>
    </body>

    </html>