
		$(document).ready(function(){
			$('#upload').click(function(){
				$.ajax({
					url: rooturl+'/members/checklogin',
					dataType:   "script",
				    success	:function(data) {
					 if(data=='true'){
					 	window.location.href=rooturl+'/submit/add/';
					 }else{
					 	tb_show('登录OPEN开发经验库',rooturl+'/members/login?forward=submit&TB_iframe=true&height=177&width=278');
					 }
					}
				});
			});
			
			
			
		});			