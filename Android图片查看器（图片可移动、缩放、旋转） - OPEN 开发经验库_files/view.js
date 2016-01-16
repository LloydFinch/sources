						
	$(document).ready(function(){
		
		$('#summary-hide').click(function(){
			$('#summary-content').show();
			$('#summary-fullcontent').hide();
			return false;
		});
		$('#summary-show').click(function(){
			$('#summary-content').hide();
			$('#summary-fullcontent').fadeIn("slow");
			return false;
		});
		$('#rate').mouseout(function(){
			setRate(wgDocScoreByUser);
		});
		$('#rate span').mouseover(function(){
			var nScore = $(this).attr('id').substring(4);
			setRate(nScore);
		}).click(function(){
			var nScore = $(this).attr('id').substring(4);
			rateDoc(nScore);
		});

		getDocFavoriteByUser();
		$('#favorite-box').dialog({
			autoOpen:false,
			title:'收藏提示',
			modal:true,
			resizable:false,
			buttons:{
				'取消':function(){			
					$('#favorite-box').dialog('close');
				},
				'确认':function(){
					//favorite;
					if(favoriteDocument()){
						$('#favorite-box').dialog('close');					
					}
				}
			},
			close:function(){
				$('#reader').css('visibility','visible');
				//$('#reader').css('margin-top','0'); //fix for firefox
			}
		});
		
		$('#upload').click(function(){
			if (wgUserLogined){
					window.location.href=rooturl+'/submit/add/';
				}else{
					gologin('upload');
				}
		});

		
		
		$('#favorite').click(function(){
			if (!wgUserLogined){
				gologin('favorite');
			 	return false;
			}
			loadUserFolders();
			$('#fav_folderlist').change(function(){
				if ($(this).val() == "-1" ){
					$('#newfolder-input').css('display','');
				}else{
					$('#newfolder-input').css('display','none');
				}
				return false;
			});
			
			$('#reader').css('visibility','hidden');
			$('#favorite-box').dialog('open');
			return false;
		});
		
		getDocScoreByUser();


	});

	function gologin(download){
		$('#reader').css('visibility','hidden');
		tb_show('登录OPEN开发经验库',rooturl+'/members/login?forward='+download+'&TB_iframe=true&height=177&width=278');
	}

	function rateDoc(nScore){
		$.ajax({
			url	:rooturl+"/view/filerate/"+wgDocKey,
			type	:"GET",
			dataType:"json",
			data	:"score="+nScore,
			success	: function(data){
				if (data.status=='success'){
					wgDocScoreByUser = nScore;
					setRate(wgDocScoreByUser);
				}else if (data.status=='nologin'){
					gologin("rating");
				}else if (data.status=='false'){
					alert(data.message);
				}
			}
		});
	}

	function getDocScoreByUser(){
		if (wgDocScoreByUser!=null && wgDocScoreByUser!=0){
			setRate(wgDocScoreByUser);
		}
	}

	function getDocFavoriteByUser(){
		if (wgDocFavoriteByUser==false){
			$.ajax({
				type:'GET',
				url: rooturl+'/view/getfilefavorite',
				data:"id="+wgDocKey,
				dataType:"json",
				success	:function(data) {
					if (data.status == 'favorited'){
						wgDocFavoriteByUser=data.folder;
						setFavorite(wgDocFavoriteByUser);
					}
					return false;
				}
			});
		}else{
			setFavorite(wgDocFavoriteByUser);
		}
	}

	function loadUserFolders(){
		if (wgUserFolders==null){
			//read folders;
			$.ajax({
				type:'POST',
				url: rooturl+'/view/getfolders',
				dataType:"json",
				success	:function(data) {
					wgUserFolders=data;
					if (data.length>0){
						$('#newfolder-sp').before('<option value="" disabled=disabled>-------------</option>');
					
						for(i=0;i<data.length;i++){
							f=data[i];
							$('<option value="'+f.id+'">'+f.name+'('+f.fnum+')</option>').insertBefore('#newfolder-sp');
						}	
					}
					return false;
				}
			});
		}
	}

	function favoriteDocument(){
		var fid = $('#fav_folderlist').val();
		var ftags = $('#fav_tags').val();
		var newfolder = $('#fav_newfolder').val();
		if(fid==0 && newfolder==''){
			alert('请选择或新增一个收藏夹！');
			return false;
		}
		$.ajax({
			type:'POST',
			url: rooturl+'/user/filefavorite',
			dataType:"json",
			data:"id="+wgDocKey+"&folder="+fid+"&newfolder="+newfolder+"&tags="+ftags,
			success	:function(data) {
				if (data.status = 'success'){
					wgDocFavoriteByUser=data.folder;
					setFavorite(data.folder);					
				}else{
					alert(data.message);
				}
				$('#favorite-box').hide();
				return true;
			}
		});
		return true;
	}

	function opendownDialog(){
		$('#reader').css('visibility','hidden');
		$('#download-confirm').dialog('open');
	}
	
	function openfavDialog(){
		$('#reader').css('visibility','hidden');
		loadUserFolders();
		
		$('#fav_folderlist').change(function(){
				if ($(this).val() == "-1" ){
					$('#newfolder-input').css('display','');
				}else{
					$('#newfolder-input').css('display','none');
				}
				return false;
		});
		$('#favorite-box').dialog('open');
		return false;
	}
		
	function downloadSubmit(){
		if (wgDownFrame==null){
			wgDownFrame = '<iframe frameborder=0 width=0 height=0 src="about:blank" name="downframe"></iframe>';
			$('#download-confirm').append(wgDownFrame);
		}
		$('#downloadform').attr('target','downframe');
		$('#downloadform').submit();
	}
	function setRate(nScore){
		var i;
		for(i=1;i<=5;i++){
			$('#star'+i).attr('class',(i <= nScore ? 'star-big-on':'star-big-off'));
		}
		var tip = $('#star'+nScore).attr('title');
		$('#rate-tip').html(tip);
	}
	function setFavorite(folder){
		var tip = '已收藏到 ';
		if (folder != null){
		    tip += '<a target=_blank href="'+rooturl+'/user/myfavorite/'+folder.id+'"><b>'+folder.name+'</b></a>';
		}else{
		    tip += '<a target=_blank href="'+rooturl+'/user/myfavorite/0">我的收藏夹</a>';
		}
		tip += '!';
		$('#favorite-container').html("<b>"+tip+"</b>");	
	}