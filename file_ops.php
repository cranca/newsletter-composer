<?php

require_once 'common.php';

// check user is logged in
if (login_ok() == 1) {
	
	$rel_user_path = 'users/' . $_SESSION['uid'] . '/';
	
	if (strcmp($_POST['task'], 'list_files') == 0)
	{
		$handle = opendir($rel_user_path);
	
		// Make an array containing the files in the user's directory
		$files = array();
		while ($file = readdir($handle)) 
		{ 
			$files[] = $file; 
		} 
		closedir($handle);
		
		echo json_encode($files);
	}

	else if (strcmp($_POST['task'], 'delete_file') == 0)
	{
		//error_reporting(E_ALL);
		//ini_set('display_errors', 1);
		
		// delete the specified file
		if (unlink(realpath($rel_user_path . $_POST['filename'])))
		{
			echo 'deleted ' . $_POST['filename'];
		}
		else {
			echo 'Fail: could not delete ' . $rel_user_path . $_POST['filename'];
		}
	}
	
	else
	{
		echo "<p>Fail. unrecognised task: {$_POST['task']}</p>";
	}
	
} else {
	echo '<p>Fail. Could not verify user. Login again.</p>';
}
