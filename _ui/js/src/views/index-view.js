/**
 *  Index View
 *      - controls search and track list
 */

var TumblrMusic = TumblrMusic || {};

(function($, _, Backbone, exports) {
    
    var IndexView = Backbone.View.extend({

        el: '#index',
        
        // Defaults
        defaults: {
            
        },

        // Events
        events: {
            'keydown .search-bar': '__searchKeydown',
            'click .track': '__trackClick',
            'click .load-more': '__loadMoreClick'
        },

        // Search Keydown Event
        __searchKeydown: function(e) {
            // enter key
            if(e.which !== 13) return;

            // get audio posts
            this.username = this.$searchBar.val();
            this.model.fetch(this.username);
            this.$searchBar.addClass('searching');
        },

        // Track Click Event
        __trackClick: function(e) {
            e.preventDefault();

            var $target = $(e.currentTarget);

            this.trigger('track:select', {
                trackEl: e.currentTarget,
                trackIndex: $target.data('index'),
                trackAlbumArt: $target.data('album-art')
            });
        },

        // Load More Click Event
        __loadMoreClick: function(e) {
            e.preventDefault();
            this.model.fetch(this.username);
        },

        // Check Hash
        _checkHash: function() {
            var hash = window.location.hash;

            if(hash) {
                hash = hash.replace('#', '');
                this.username = hash;
                this.$searchBar.val(this.username);
                this.model.fetch(this.username);
            } else {
                this.$searchBar.focus();
            }
         },
        
        // Initialize
        initialize: function(options) {
            // options
            this.options = _.extend({}, this.defaults, options);

            // vars
            this.template = _.template($('#track-list-template').html());
            this.username = '';
            this.blogUrl = '';

            // elements
            this.$searchBar = this.$('.search-bar');
            this.$tracksContainer = this.$('.tracks-container');
            this.$trackList = this.$('.track-list');

            // events
            this.listenTo(this.model, 'change', this.renderTrackList);

            // setup
            this._checkHash();
        },

        // Render Track List
        renderTrackList: function() {
            var data = this.model.toJSON();

            console.log(data);

            if(_.isEmpty(data)) return;

            this.$el.addClass('show-tracks');
            this.$searchBar.removeClass('searching');

            // remove load more
            var $loadMore = this.$('.load-more');
            if($loadMore.length) {
                $loadMore.remove();
            }

            // render
            var renderData = this.template(_.extend(data, {
                more_posts: _.size(data.posts) < data.total_posts
            }));

            if(this.blogUrl === data.blog.url) {
                this.$trackList.append(renderData);
            } else {
                this.$trackList.html(renderData);
            }

            this.blogUrl = data.blog.url;
        }

    });

    exports.IndexView = IndexView;
    
})(jQuery, _, Backbone, TumblrMusic);