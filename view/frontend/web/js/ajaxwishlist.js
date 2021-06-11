define([
    'jquery',
     'Magento_Ui/js/modal/modal',
    'mage/template',
    'mage/url',
    'jquery/ui',
    'mage/loader'
   
], function($, modal, mageTemplate, url) {
    'use strict';

    $.widget('magepow.ajaxWishlist', {

        options: {
            addToWishlistSelector: '[data-action="add-to-wishlist"]',
            removeFromWishlistSelector: '.block-wishlist .btn-remove',
            wishlistBlockSelector: '#wishlist-view-form',
            formKeyInputSelector: 'input[name="form_key"]',
            notLoggedInErrorMessage: 'Please <a href="<%- url %>">log in</a> to be able add items to wishlist.',
            errorMessage: 'There is an error occurred while processing the request.',
            isShowSpinner: true,
            isShowSuccessMessage: true,
            customerLoginUrl: null,
            buttonClose: '.action-close',
            popupWrapperSelector: '.show-popup-wapper-wishlist',
            popupTtl: null

        },

        _create: function() {
            var self = this;
            this._bind();
            this.viewWishlist();
            this.closePopup();
            
        },

        closePopup: function() {
            $(document).on('click', '#ajaxwishlist_btn_close_popup' , function() {
                $(this.options.buttonClose).trigger('click');
            })
        },
        
        viewWishlist: function(){
            $(document).on('click', "#wishlist_checkout", function() {
                window.location.replace(url.build('wishlist'));
            })
        },
        _bind: function () {
            var selectors = [
                this.options.addToWishlistSelector,
                this.options.removeFromWishlistSelector
            ];

            $('body').on('click', selectors.join(','), $.proxy(this._processViaAjax, this));
        },


        _processViaAjax: function(event) {
            var post = $(event.currentTarget).data('post'),
                url = post.action,
                data = $.extend(post.data, {form_key: $(this.options.formKeyInputSelector).val()});
            $.ajax(url, {
                method: 'POST',
                data: data,
                showLoader: this.options.isShowSpinner
            }).done($.proxy(this._successHandler, this)).fail($.proxy(this._errorHandler, this));

            event.stopPropagation();
            event.preventDefault();
        },

        _successHandler: function(data) {
            var self = this,
                wishlistPopup = $(self.options.popupWrapperSelector),
                body = $('body');
            if (!data.success && data.error == 'not_logged_in') return;
            $(this.options.wishlistBlockSelector).replaceWith(data.wishlist);
            
            if (this.options.isShowSuccessMessage && data.message) {
                if (!wishlistPopup.length) {
                    body.append('<div class="show-popup-wapper-wishlist">'+data.message+'</div>');
                }
                self._showPopup();
                if (self.options.popupTtl) {
                    var wishlist_autoclose_countdown = setInterval(function (wrapper) {
                    var leftTimeNode = $(document).find('#ajaxwishlist_btn_close_popup .wishlist-autoclose-countdown');
                    var leftTime = parseInt(leftTimeNode.text()) - 1;                   
                    leftTimeNode.text(leftTime);
                    if (leftTime <= 0) {
                        $(self.options.buttonClose).trigger('click').fadeOut('slow');
                        clearInterval(wishlist_autoclose_countdown);  
                        }
                    }, 1000);
                }
                self.viewWishlist();
            }
        },

          _showPopup: function() {
            var self = this,
                wishlistPopup = $(self.options.popupWrapperSelector);
            var modaloption = {
                type: 'popup',
                modalClass: 'modal-popup_ajaxwishlist_magepow',
                responsive: true,
                innerScroll: true,
                clickableOverlay: true,
                closed: function(){
                   $('.modal-popup_ajaxwishlist_magepow').remove();
                }
            };
            modal(modaloption, wishlistPopup);
            wishlistPopup.modal('openModal');
        },

        _errorHandler: function () {
            console.warn("Add to the wish list unsuccessful");
        }

    });

    return $.magepow.ajaxWishlist;

});