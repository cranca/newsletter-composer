// user rego form validation
function validatePassword()
{
	var pass1 = $('#new_pwd');
	var pass2 = $('#conf_pwd');
	if( pass1.val() != pass2.val() ){  
        pass2.addClass("error");  
        return false;  
    } else{  
        pass2.removeClass("error");  
        return true;  
    }  
}

// change password form validation
function validateChangePassword()
{
	var pass1 = $('#ch_pwd');
	var pass2 = $('#conf_ch_pwd');
	if( pass1.val() != pass2.val() ){  
        pass2.addClass("error");  
        return false;  
    } else{  
        pass2.removeClass("error");  
        return true;  
    }  
}

// simply pad a number with leading zeros
function pad(number, length)
{
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

// encode string for HTML
/*Author: R Reid
 * source: http://www.strictly-software.com/htmlencode
 */
function encodeHTML(str)
{
	var encoded = "";
	for (var i = 0; i < str.length; i++)
	{
		var c = str.charAt(i);
		if (c < ' ' || c > '~' || c == '"')
		{
			c = "&#" + c.charCodeAt() + ";";
		}
		encoded += c;
	}
	return encoded;

}

// decode string encoded by encodeHTML
/*Author: R Reid
 * source: http://www.strictly-software.com/htmlencode
 */
function decodeHTML(str)
{
		var c,m,decoded = str;
		
		// look for numerical entities &#34;
		arr=decoded.match(/&#[0-9]{1,5};/g);
		
		// if no matches found in string then skip
		if(arr!=null){
			for(var x=0;x<arr.length;x++){
				m = arr[x];
				c = m.substring(2,m.length-1); //get numeric part which is reference to unicode character
				// if its a valid number we can decode
				if(c >= -32768 && c <= 65535){
					// decode every single match within string
					decoded = decoded.replace(m, String.fromCharCode(c));
				}else{
					decoded = decoded.replace(m, ""); //invalid so replace with nothing
				}
			}			
		}

		return decoded;
}

// clear form elements handling each type properly
jQuery.fn.clearForm = function() {
  return this.each(function() {
    var type = this.type, tag = this.tagName.toLowerCase();
    if (tag == 'form')
      return $(':input',this).clearForm();
    if (type == 'text' || type == 'password' || tag == 'textarea')
      this.value = '';
    else if (type == 'checkbox' || type == 'radio')
      this.checked = false;
    else if (tag == 'select')
      this.selectedIndex = -1;
  });
};

// cookies expire 1 year from now.
var oneYear = new Date();
oneYear.setDate(oneYear.getDate() + 365);
jQuery.cookies.setOptions({expiresAt: oneYear});

var MAX_WIDTH = 600; // for image uploaded to server
var MAX_WIDTH_UI = 200; // for preview of image displayed in the user interface

/*
 * I've decided I don't need to use TinyMCE - it's not that "tiny"
 * It's far to big for the simple task I require,
 * and it's limited to working on text areas, not text fields.
 * I'll use a simple wiki-type syntax instead.
// settings for TinyMCE editors
var TMCEsettings = {
			// Location of TinyMCE script
			script_url : 'js/tiny_mce/tiny_mce.js',

			// General options
			theme : "advanced",
		   onchange_callback : setNewsletterCookie,

			// Theme options
			theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,link,unlink,",
			theme_advanced_buttons2 : "",
			theme_advanced_buttons3 : "",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_resizing : true,

			// Example content CSS (should be your site CSS)
			content_css : "css/newsletterComposer.css"
		};
*/

// read image data from file, then use canvas element to set max size then upload and save on server
var imageUploadHandler = function(event){
	var file = $(this)[0].files[0]; // get file from file selector input that triggered this
	var uploadedDiv = $(this).siblings('div.uploadedData'); // div that displays the uploaded image
	var canvas = document.createElement("canvas"); // canvas to change image size
	var context2d = canvas.getContext("2d");
	if (!file.type.match(/image.*/)) {
		alert('that file is not an image.');
	} else {
		var img = document.createElement("img"); // need an img element to read file into
		var reader = new FileReader(); // HTML 5 goodness
		img.onload = function(e) { // when the file has finished being read into the img element
			// size the canvas to receive the image
			if (img.width > MAX_WIDTH) {
				canvas.height = img.height * MAX_WIDTH / img.width; // keep aspect ratio of image
				canvas.width = MAX_WIDTH;
			} else {
				canvas.height = img.height;
				canvas.width = img.width;
			}
			// while we're at it resize the preview image size
			var preview = uploadedDiv.children('img');
			if (img.width > MAX_WIDTH_UI) {
				preview.css('height', img.height * MAX_WIDTH_UI / img.width); // keep aspect ratio of image
				preview.css('width', MAX_WIDTH_UI);
			} else {
				preview.css('height', img.height);
				preview.css('width', img.width);
			}
			// draw image to the canvas
			context2d.drawImage(img, 0, 0, canvas.width, canvas.height);
			// if the file is jpeg then upload it as one
			// otherwise upload it as a png
			var uploadType = file.type;
			var extension = 'jpg';
			if (uploadType != 'image/jpeg') {
				uploadType = 'image/png';
				extension = 'png'
			}
			// post the image data to php script using ajax
			//alert(file.name);
			jQuery.post('save_image.php', { 'filename': file.name, 'ext': extension, 'data': canvas.toDataURL(uploadType) }, function(data_returned) {
				// when it's uploaded to the server and saved then set the image preview to source from there.
				uploadedDiv.find('input').val(data_returned); // this is so the uploaded image src can be saved in the cookies
				uploadedDiv.find('img').attr('src', 'users/' + userName + '/images/' + encodeURIComponent(data_returned));
				setNewsletterCookie();
			});
		}
		reader.onload = function(e) {
			// when the reader has read the file get it into the img element
			img.src = e.target.result;
		}
		// use the reader to read the file
		reader.readAsDataURL(file);
	}
};

// a whole bunch of html is inserted dynamically. It's defined here.
var controls = '<div class="controls">';
controls += '<img class="up" src="images/move_up.png" />';
controls += '<img class="down" src="images/move_down.png" />';
controls += '<img class="delete" src="images/delete.png" />';
controls += '</div>';

//var addTitleButton = '<button class="addTitle">Add title</button>';
var addParaButton = '<button class="addPara" title="Add some text">Add text</button>';
//var addListItemButton = '<button class="addLI">Add list item</button>';
var addImageButton = '<button class="addImage" title="Add an image">Add image</button>';
var articleField = "<fieldset class=\"article moveable ui-corner-all\"><legend>Article</legend>\n";
articleField += '<div><label>Title</label> <input type="text" class="articleTitle" /></div>';
articleField += controls + "\n";
articleField += "<div class=\"article_buttons\">\n";
//articleField += addTitleButton + "\n";
articleField += addParaButton + "\n";
//articleField += '<br/>';
//articleField += addListItemButton + "\n";
articleField += addImageButton + "\n";
articleField += "</div>\n</fieldset>\n";

var titleField = '<div class="moveable">' + controls + '<label>Title</label> <input type="text" class="articleTitle input-issue save" /></div>';

var paraField = '<div class="moveable">' + controls + '<textarea class="articlePara input-issue save" rows="8" cols="40"></textarea></div>';

var lIField = '<div class="moveable">' + controls + '<img src="images/li.png" alt="bullet" /><textarea class="articleList input-issue save" rows="8" cols="40"></textarea></div>';

var imageField = '<div class="moveable">' + controls + "\n";
imageField += "<input type=\"file\" class=\"imageUpload input-issue\" name=\"fileSelect\" />\n";
imageField += '<div class="uploadedData"><input type="hidden" class="imageLoaded input-issue save" /><img class="preview" /></div>';
imageField += "</div>\n";

var recipientRow = "<tr class=\"newRecipient\">\n";
recipientRow += "<td><input type=\"text\" class=\"name input-send save\" /></td>\n";
recipientRow += "<td><input type=\"text\" class=\"email input-send save\" /></td>\n";
recipientRow += "<td><button class=\"addGreeting\">Add personal greeting</button>\n";
recipientRow += "<textarea  class=\"greeting greetingA hidden\" rows=\"3\" cols=\"30\"></textarea></td>\n";
recipientRow += "<td><textarea  class=\"greeting greetingB hidden\" rows=\"3\" cols=\"30\"></textarea></td></tr>\n";
// the delete button added when the row is not the "new" one at the bottom that triggers new rows to be added
recipientControl = "<td class=\"controls\"><img class=\"delete\" src=\"images/delete.png\" /></td>\n";


// functions for controls
var deleteElement = function() {
	$(this).parent().parent().remove();
	setNewsletterCookie();
};
var moveUp = function() {
	$(this).parent().parent().insertBefore($(this).parent().parent().prev());
	setNewsletterCookie();
};
var moveDown = function() {
	$(this).parent().parent().insertAfter($(this).parent().parent().next());
	setNewsletterCookie();
};
function bindControls(elements) {
	elements.find('.up').click(moveUp);
	elements.find('.down').click(moveDown);
	elements.find('.delete').click(deleteElement);
}

function logoMugshotHandler(container) {
		//var parent = $(this).parent();
		var uploadControl = "<input type=\"file\" class=\"imageUpload input-issue\" name=\"fileSelect\" />\n";
		uploadControl += '<button class="removeImage">Remove</button>';
		uploadControl += '<div class="uploadedData"><input type="hidden" class="imageLoaded input-issue save" /><img class="preview" /></div>';
		container.find('button').replaceWith(uploadControl);
		container.find('.imageUpload').bind('change', imageUploadHandler);
		container.find('.input-issue.save').change(setNewsletterCookie);
		container.find('button.removeImage').button({icons:{primary: "ui-icon-trash"},text:false}).click(function(){
			var parent = $(this).parent()
			parent.find('input.imageUpload').remove();
			parent.find('input.imageLoaded').parent().remove();
			var freshButton = '<button>Upload</button>';
			$(this).replaceWith(freshButton);
			parent.find('button').button({icons:{primary: "ui-icon-image"},text:false}).click(function(){
				logoMugshotHandler($(this).parent());
			});
			setNewsletterCookie();
		});
};

/*/ harvest the personal data entered
function collectPersonalData() {
	var data = {
		"addressLine1": encodeHTML($('#address_line_1').val()),
		"addressLine2": encodeHTML($('#address_line_2').val()),
		"phone": encodeHTML($('#phone').val()),
		"skype": encodeHTML($('#skype').val()),
		"website": encodeHTML($('#personal_web').val()),
		"org": encodeHTML($('#org_name').val()),
		"websiteOrg": encodeHTML($('#org_web').val())
	};
	return data;
}
*/
	
// harvest the data entered for the newsletter
function collectNewsletterData() {
	// make a JSON object for the form data
	//debugger;
	var logo = '';
	var mugshot = '';
	if ($('#logo .imageLoaded').length > 0) logo = $('#logo .imageLoaded').val();
	if ($('#mugshot .imageLoaded').length > 0) mugshot = $('#mugshot .imageLoaded').val();
	var saveData = {
		"template": $('#template').val(),
		"title": encodeHTML($('#newsletterTitle').val()),
		"number": encodeHTML($('#issuenum').val()),
		"date": encodeHTML($('#issuedate').val()),
		"logo": logo,
		"mugshot": mugshot,
		"header": {
			"email": encodeHTML($('#emailHeader > textarea').val()),
			"web": encodeHTML($('#webHeader > textarea').val()),
			"print": encodeHTML($('#printHeader > textarea').val())
		},
		"footer": {
			"email": encodeHTML($('#emailFooter > textarea').val()),
			"web": encodeHTML($('#webFooter > textarea').val()),
			"print": encodeHTML($('#printFooter > textarea').val())
		},
		"privacy": $('input:radio[name=privacy]:checked').attr('id'),
		"privacy_user": encodeHTML($('#privacy_username').val()),
		"privacy_pass": encodeHTML($('#privacy_password').val()),
		"mainArticles": [],
		"sideArticles": []
	};
	
	// now we need to gather the data from the articles
	$('#leftPanel').find('.article').each(function() {
		var article = {"title": encodeHTML($(this).find('.articleTitle').val()), "article": []};
		$(this).find('.save').each(function() {
			var itemType = '';
			var itemValue = '';
			if ($(this).hasClass('articlePara')) { itemType = "para"; }
			else if ($(this).hasClass('articleList')) { itemType = "list"; }
			else if ($(this).hasClass('imageLoaded')) { itemType = "image"; }
			else { itemType = "undefined" }
			itemValue = encodeHTML($(this).val());
			var item = {"type": itemType, "value": itemValue};
			article.article.push(item);
		});
		saveData.mainArticles.push(article);
	});
	$('#rightPanel').find('.article').each(function() {
		var article = {"title": encodeHTML($(this).find('.articleTitle').val()), "article": []};
		$(this).find('.save').each(function() {
			var itemType = '';
			var itemValue = '';
			if ($(this).hasClass('articlePara')) { itemType = "para"; }
			else if ($(this).hasClass('articleList')) { itemType = "list"; }
			else if ($(this).hasClass('imageLoaded')) { itemType = "image"; }
			else { itemType = "undefined" }
			itemValue = encodeHTML($(this).val());
			var item = {"type": itemType, "value": itemValue};
			article.article.push(item);
		});
		saveData.sideArticles.push(article);
	});
	return saveData;
}

// harvest the send data entered
function collectSendData() {
	var data = {
		"from": $('#from').val(),
		"subject": $('#subject').val(),
		"greeting": $('#greeting').val(),
		"smtp_host": $('#smtpHost').val(),
		"smtp_port": $('#smtpPort').val(),
		"smtp_user": $('#smtpUser').val(),
		"smtp_pass": $('#smtpPass').val(),
		"recipients": []
	};
	// now gather the recipients data
	$('.recipient').each(function() {
		data.recipients.push({
		   "name": $(this).find('.name').val(),
		   "email": $(this).find('.email').val(),
		   "greetingA": $(this).find('.greetingA').val(),
		   "greetingB": $(this).find('.greetingB').val()
		});
	});
	return data;
}

// these functions save the form data so the user can come back to it
var setNewsletterCookie = function() {
	var saveData = collectNewsletterData();
	// save it all in one cookie
	jQuery.cookies.set($('#newsletterTitle').val() + '_' + $('#issuenum').val(), saveData);
	// also set a cookie to tell us the name of the cookie containing the most recent saved
	jQuery.cookies.set('latest', $('#newsletterTitle').val() + '_' + $('#issuenum').val());
};
var setPersonalCookie = function() {
	var saveData = collectPersonalData();
	jQuery.cookies.set('personal', saveData);
}
var setSendCookie = function() {
	var saveData = collectSendData();
	jQuery.cookies.set('send', saveData);
}

// when content is added dynamically we have to remember to also bind event handlers, etc
function bindArticleButtons(article) {
	article.find('.addTitle').click(function(){
		var field = $(titleField);
		bindControls(field);
		field.find('.input-issue.save').change(setNewsletterCookie);
		field.insertBefore($(this).parent());
	});
	article.find('.addPara').click(function(){
		var field = $(paraField);
		bindControls(field);
		field.find('.input-issue.save').change(setNewsletterCookie);
		field.insertBefore($(this).parent());
	});
	article.find('.addLI').click(function(){
		var field = $(lIField);
		bindControls(field);
		field.find('.input-issue.save').change(setNewsletterCookie);
		field.insertBefore($(this).parent());
	});
	article.find('.addImage').click(function(){
		var field = $(imageField);
		bindControls(field);
		field.find('.imageUpload').bind('change', imageUploadHandler);
		field.find('.input-issue.save').change(setNewsletterCookie);
		field.insertBefore($(this).parent());
	});
	article.find('button.addImage').button({icons:{primary: "ui-icon-image"},text:false});
	article.find('button.addPara').button({icons:{primary: "ui-icon-document"},text:false});
}

// build a filled in set of form articles from an array
// insert them all before the following element
function buildArticles(array, followingElement) {
	// go through each article in the array
	for (var a = 0; a < array.length; ++a) {
		var art = $(articleField);
		// put the title in first
		art.find('.articleTitle').val(decodeHTML(array[a].title));
		// within the article go through each field
		for (var i = 0; i < array[a].article.length; ++i) {
			if (array[a].article[i].type == "para") {
				var paragraph = $(paraField)
				bindControls(paragraph);
				paragraph.find('textarea').text(decodeHTML(array[a].article[i].value));
				art.find('.article_buttons').before(paragraph);
			//} else if (array[a].article[i].type == "list") {
			//	var listItem = $(lIField)
			//	bindControls(listItem);
			//	listItem.find('textarea').text(decodeHTML(array[a].article[i].value));
			//	art.find('.article_buttons').before(listItem);
			} else if (array[a].article[i].type == "image") {
				var image = $(imageField)
				bindControls(image);
				//image.find('input').val(array[a].article[i].value);
				image.find('.imageLoaded').val(array[a].article[i].value);
				image.find('img.preview').attr('src', 'users/' + userName + '/images/' + encodeURIComponent(array[a].article[i].value));
				image.find('.imageUpload').bind('change', imageUploadHandler);
				art.find('.article_buttons').before(image);
			} else {
				alert('Could not restore article item. Unknown type: ' + array[a].article[i].type);
			}
		}
		bindControls(art);
		bindArticleButtons(art);
		followingElement.before(art);
	}
	
}

var addRecipientHandler = function(){
		$("tr.newRecipient > td > input").unbind('change.addRecipient');
		var addedRow = $(recipientRow);
		addedRow.find('textarea.greeting').hide();
		addedRow.find('button.addGreeting').click(function(){
			$(this).parent().parent().find('textarea.greeting').show();
			$(this).hide();
		});
		$("tr.newRecipient").after(addedRow);
		$("tr.newRecipient:first").append(recipientControl);
		$("tr.newRecipient:first").addClass('recipient').removeClass('newRecipient').find('.input-send.save').change(setSendCookie);
		$("tr.newRecipient > td > input").bind('change.addRecipient', addRecipientHandler);
		setSendCookie();
};

// restore form content from JSON
function restore(jsonData) {
	//debugger;
	$('#newsletterTitle').val(decodeHTML(jsonData.title));
	$('#issuenum').val(decodeHTML(jsonData.number));
	$('#issuedate').val(decodeHTML(jsonData.date));
	if (jsonData.logo.length > 0)
	{
		logoMugshotHandler($('#logo'));
		$('#logo > .uploadedData').find('input').val(jsonData.logo);
		$('#logo > .uploadedData').find('img').attr('src', 'users/' + userName + '/images/' + encodeURIComponent(jsonData.logo));
	}
	if (jsonData.mugshot.length > 0)
	{
		logoMugshotHandler($('#mugshot'));
		$('#mugshot > .uploadedData').find('input').val(jsonData.mugshot);
		$('#mugshot > .uploadedData').find('img').attr('src', 'users/' + userName + '/images/' + encodeURIComponent(jsonData.mugshot));
	}
	$('#emailHeader > textarea').val(decodeHTML(jsonData.header.email));
	$('#webHeader > textarea').val(decodeHTML(jsonData.header.web));
	$('#printHeader > textarea').val(decodeHTML(jsonData.header.print));
	$('#emailFooter > textarea').val(decodeHTML(jsonData.footer.email));
	$('#webFooter > textarea').val(decodeHTML(jsonData.footer.web));
	$('#printFooter > textarea').val(decodeHTML(jsonData.footer.print));
	$('#' + jsonData.privacy).attr('checked', true).button("refresh");
	$('#privacy_username').val(decodeHTML(jsonData.privacy_user));
	$('#privacy_password').val(decodeHTML(jsonData.privacy_pass));
	if (jsonData.privacy === 'privacy_protected') $('#privacy_credentials').show();
	buildArticles(jsonData.mainArticles, $('#leftPanel .addArticle'));
	buildArticles(jsonData.sideArticles, $('#rightPanel .addArticle'));
}
function restoreSend(jsonData) {
	$('#from').val(jsonData.from);
	$('#subject').val(jsonData.subject);
	$('#greeting').val(jsonData.greeting);
	$('#smtpHost').val(jsonData.smtp_host);
	$('#smtpPort').val(jsonData.smtp_port);
	$('#smtpUser').val(jsonData.smtp_user);
	$('#smtpPass').val(jsonData.smtp_pass);
	// if there are already recipients in the table insert these new ones before those
	// otherwise just put them before the newRecipient field
	var following;
	if ($('#all_recipients.recipient').length)
	{
		following = $('#all_recipients.recipient').first();
	}
	else
	{
		following = $('.newRecipient');
	}
	for (var a = 0; a < jsonData.recipients.length; ++a)
	{
		var row = $(recipientRow);
		row.append(recipientControl);
		row.find('.name').val(jsonData.recipients[a].name);
		row.find('.email').val(jsonData.recipients[a].email);
		if (jsonData.recipients[a].greetingA || jsonData.recipients[a].greetingB)
		{
			row.find('.addGreeting').hide();
			row.find('.greetingA').val(jsonData.recipients[a].greetingA);
			row.find('.greetingB').val(jsonData.recipients[a].greetingB);
		} else {
			row.find('.greetingA').hide();
			row.find('.greetingB').hide();
		}
		row.addClass('recipient').removeClass('newRecipient').find('.input-send.save').change(setSendCookie);
		following.before(row);
	}
}

//TODO: provide feedback to users about when they are entering a valid or invalid username or password

function validPrivacyUsername(username) {
	if (username.length == 0) return false;
	// username cannot start with a hash or it will be a comment in the .htpasswd file
	if (username.charAt(0) == '#') return false;
	// username cannot contain a colon as this has special meaning in the .htpasswd file
	if (username.indexOf(':') >= 0) return false;
	return true;
}

function validPrivacyPassword(password) {
	if (password.length == 0) return false;
	return true;
}

var htaccessSetUnset = function() {
	var username = jQuery.trim($('#privacy_username').val());
	var password = jQuery.trim($('#privacy_password').val());
	if (validPrivacyUsername(username) && validPrivacyPassword(password))
	{
		$('#privacy_msg').load('htaccess.php', {'username': username, 'password':password, 'action':'set'}, function(){
			$('#privacy_msg').show().fadeOut(3000);
		});
	}
	else
	{
		$('#privacy_msg').load('htaccess.php', {'action':'unset'}, function(){
			$('#privacy_msg').show().fadeOut(3000);
		});
	}
};

var sendScript = "send_newsletter.php";
var sendEmail = function(recipient) {
	
	var greetingA;
	if (recipient.find('.greetingA').val() == '') greetingA = $('#generic_a').val();
	else greetingA = recipient.find('.greetingA').val();
	
	var greetingB;
	if (recipient.find('.greetingB').val() == '') greetingB = $('#generic_b').val();
	else greetingB = recipient.find('.greetingB').val();
	
	//TODO: if online content is protected add username and password to email_file
	
	var data = {
			to_address: recipient.find('.email').val(),
			from_address: $('#from').val(),
			name: encodeURIComponent(recipient.find('.name').val()),
			greetingA: encodeURIComponent(greetingA),
			greetingB: encodeURIComponent(greetingB),
			email_file: $('#newsletter_file_name').val(),
			//email_content: file_get_contents($('#newsletter_file_name').val()),
			subject_line: encodeURIComponent($('#subject').val()),
			smtp_host: $('#smtpHost').val(),
			smtp_port: $('#smtpPort').val(),
			smtp_user: $('#smtpUser').val(),
			smtp_pass: $('#smtpPass').val()
	};
	
	jQuery.post(sendScript, data).done(function(returnData){
		$('#sentEmails').append(returnData);
		alert(returnData);
	}).fail(function(jqXHR, textStatus){
		alert('Sending error: ' . textStatus);
	});
		  
};

$(document).ready(function() {

	//debugger; 
	
	// hide everything that should be hidden
	$('.hidden').hide();
	
	// apply jQueryUI elements
	$( ".tabs" ).tabs();
	$( "#accordion" ).accordion();
	$( "button" ).button();
	$( ".button" ).button();
	$( "#logo > button, #mugshot > button" ).button({
		icons: {
			primary: "ui-icon-image"
		},
		text: false
	});
	$( "#privacy_radioset" ).buttonset();
	
	// put a show toggle button on password fields that want one
	// this code swaps out the entire input field
	// adapted from code by Aaron Saray
	$('#show_privacy_password').click(function() {
		var inputField = $('#privacy_password');
		var change = $(this).is(":checked") ? "text" : "password";
		var rep = $("<input type='" + change + "' />");
		rep.attr("id", inputField.attr("id"));
		rep.attr("name", inputField.attr("name"));
		rep.attr('class', inputField.attr('class'));
		rep.val(inputField.val());
		rep.change(htaccessSetUnset);
		rep.insertBefore(inputField);
		inputField.remove();
        inputField = rep;
    });
	
	// bind buttons that reveal things
	$('.reveal_trigger').click(function(){
		$(this).parent().find('.hidden').show();
	});
	
	$('#privacy_protected').click(function(){
		$('#privacy_credentials').show();
	});
	
	$('#privacy_public').click(function(){
		$('#privacy_credentials').hide();
		$('#privacy_msg').load('htaccess.php', {'action':'unset'});
	});
	
	// bind button to bring up file upload controls for logo and mugshot
	$('#logo > button, #mugshot > button').click(function(){
		logoMugshotHandler($(this).parent());
	});
	
	// bind rego form validation
	$('#conf_pwd').blur(validatePassword);  
	$('#conf_pwd').keyup(validatePassword); 
	$('#rego_form').submit(function(){  
	    if(validatePassword()) return true;
	    else return false;  
	}); 
	
	// bind change password form validation
	$('#ch_pwd').blur(validateChangePassword);  
	$('#conf_ch_pwd').keyup(validateChangePassword); 
	$('#chpwd_form').submit(function(){  
	    if(validateChangePassword()) return true;
	    else return false;  
	}); 
	
	// get content already in form from cookie
	try {
		var latest = jQuery.cookies.get('latest');
		if (latest) restore(jQuery.cookies.get(latest));
	} catch(e) {
		alert('Cannot restore newsletter content. ' + e.message)
	}
	/* this data isn't there now
	try {
		var personalData = jQuery.cookies.get('personal');
		if (personalData) restorePersonal(personalData);
	} catch(e) {
		alert('Cannot restore personal content. ' + e.message)
	}
	*/
	try {
		var sendData = jQuery.cookies.get('send');
		if (sendData) restoreSend(sendData);
	} catch(e) {
		alert('Cannot restore send data. ' + e.message)
	}
	
	// bind changes to the newsletter to get saved in cookies
	$('.input-issue.save').change(setNewsletterCookie);
	$('.input-personal.save').change(setPersonalCookie);
	$('.input-send.save').change(setSendCookie);
	
	// bind the new article buttons
	$('.addArticle').click(function() {
		var newArticle = $(articleField);
		bindControls(newArticle);
		bindArticleButtons(newArticle);
		newArticle.insertBefore($(this));
	});
	
	// bind the "save issue" buttons to allow the user to receive the form data in a file
	$('.saveIssue').click(function() {
		var saveData = collectNewsletterData();
		var saveFileName = $('#newsletterTitle').val() + ' ' +$('#issuenum').val() + '.txt';
		// As far as I can tell you have to send with a form to get the client to receive the file.
		var form = $('<form method="post" action="giveFileToClient.php"></form>');
		form.append($('<input type="hidden" name="type" value="text/plain" />'));
		form.append($('<input type="hidden" name="filename" value="' + saveFileName +'" />'));
		// it doesn't work unless the content is URI encoded.
		form.append($('<input type="hidden" name="content" value="' + encodeURIComponent(JSON.stringify(saveData)) +'" />'));
		form.trigger('submit');
		// TODO: Try to work out some way of letting the user choose where to save the file.
	});
	
	// bind the "load issue" buttons to allow the user to restore form data from a file
	$('.loadIssue').change(function() {
		$('.input-issue').clearForm();
		$('.article').remove();
		var file = $(this)[0].files[0]; // get file from file selector input that triggered this
		// use a fileReader to read the file
		var reader = new FileReader(); // HTML 5 goodness
		reader.onload = function(e) {
			// when the reader has read the file decode it, parse it as JSON and use it to restore the form data
			restore(JSON.parse(decodeURIComponent(e.target.result)));
		}
		reader.readAsText(file);
	});
	
	// fix up the hover over the sneaky file input
	$('.sneaky-file-input input').mouseenter(function() {
		$(this).siblings('button').addClass('hover');
	});
	$('.sneaky-file-input input').mouseleave(function() {
		$(this).siblings('button').removeClass('hover');
	});
	
	// bind the clear form buttons
	$('.clear').click(function() {
		$('.input-issue').clearForm();
		$('.article').remove();
	});
	
	// bind the privacy fields to call the script that creates or deletes the .htaccess files
	$('#privacy_radioset input').change(function(){
		if($('#privacy_radioset input:checked')[0].id === 'privacy_public')
		{
			$('#privacy_msg').load('htaccess.php', {'action':'unset'}, function(){
				$('#privacy_msg').show().fadeOut(3000);
			});
		}
		if($('#privacy_radioset input:checked')[0].id === 'privacy_protected')
		{
			htaccessSetUnset();
		}
	});
	$('#privacy_username, #privacy_password').change(htaccessSetUnset);
	
	// once the data is entered into the form the user can click to generate the html newsletter
	$('#generate').click(function(){
		// send the content to the php code that generates the newsletter
		var data = {
			//personal: JSON.stringify(collectPersonalData()),
			newsletter: JSON.stringify(collectNewsletterData())
		};
		// the generate_newsletter php returns some html links to the generated file that get loaded into our user interface
		$('#generateResults').html('Generating ...').load('generate_newsletter.php', data, function(response, status, xhr){
			if (status == "error") {
				$('#generateResults').html("Could not generate: " + xhr.status + " " + xhr.statusText);
			} else {
				// once it's done get ready to send the newsletter
				$('#newsletter_file_name').val($('#email_file').attr('href'));
				//$('#send').removeAttr('disabled');
				//$('#send').removeAttr('aria-disabled');
			}
		});
		
	});
	
	// the empty row in the recipients table ".newRecipient" should trigger when changed a new empty row to appear
	$("tr.newRecipient > td > input").bind('change.addRecipient', addRecipientHandler);
	
	// bind delete buttons for any recipients that came in via Excel import
	bindControls($('#all_recipients'));
	// hide all the empty personal greeting fields until the "add personal greeting" button is clicked for that recipient
	$('input.greeting').each(function(){
		if ($(this).val() == '') $(this).hide();
	});
	$('button.addGreeting').click(function(){
			// hide the "add greeting" button once it is used
			$(this).hide();
			// show the personal greeting field.
			$(this).parent().parent().find('textarea.greeting').show();
	});
	
	$('#send').click(function(){
		//TODO: add mode to check all is ready before sending
		$('#sendMessage').html('Sending...');
		var recipients = $('.recipient');
		var index = 0;
		// wait a second before sending each email out.
		// I think it's only polite not to flood the mail server
		var sendIntervalID = setInterval(function() {
			if (index == recipients.length) clearInterval(sendIntervalID);
			if (index > 0) recipients.eq(index - 1).removeClass('sending');
			recipients.eq(index).addClass('sending');
			sendEmail(recipients.eq(index));
			++index;
			if (index == recipients.length) {
				clearInterval(sendIntervalID);
				recipients.eq(index - 1).removeClass('sending');
				$('#sendMessage').html('Sent');
			}
		}, 1000);
		
	});
	
	$(window).bind('beforeunload', function(){
		setNewsletterCookie();
	});
	
/*	
	$('#loading_splash')
    .hide()  // hide it initially
    .ajaxStart(function() {
        $(this).show();
    })
    .ajaxStop(function() {
        $(this).hide();
    });
*/



});

// when images are loaded we need to make sure they're not too big.
$(window).load(function() {
	$('img.preview').each(function() {
		if (this.width > MAX_WIDTH_UI) {
			this.height = this.height * MAX_WIDTH_UI / this.width;
			this.width = MAX_WIDTH_UI;
		}
	});
});
