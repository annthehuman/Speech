<?php
if (empty($_GET['ajax'])) {
    var_dump($_POST, $_FILES);
} else {
    if (isset($_FILES['file']['size'][0])) {
        echo $_FILES['file']['tmp_name'][0];
    }
}
