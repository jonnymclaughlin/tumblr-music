/**
 *  Tumblr Model
 *      - fetches audio posts
 */

var TumblrMusic = TumblrMusic || {};

(function($, _, Backbone, exports) {
    
    var TumblrModel = Backbone.Model.extend({

        // Defaults
        defaults: {
            apiKey: 'ZxDKi6xiEPXafALWq2Mf1mKgAAY3L1Z5WQgEZjlFYNHao9ZPxv',
            limit: 20
        },

        url: function() {
            return 'http://api.tumblr.com/v2/blog/' + this.blogUrl + '/posts';
        },
        
        // Initialize
        initialize: function(options) {
            // options
            this.options = _.extend({}, this.defaults, options);

            this.blogUrl = '';
            this.offset = 0;
        },

        // Get Post
        getPost: function(index) {
            var posts = this.get('posts');
            return posts[index];
        },

        // Fetch
        fetch: function(username) {
            if(!username) return;

            var url = '';

            // check username
            if(username.indexOf('.') > -1) {
                url = username.replace(/.*?:\/\//g, '').replace('/', '');
            } else {
                url = username + '.tumblr.com';
            }

            if(url !== this.blogUrl) {
                this.offset = 0;
            }

            // set url
            this.blogUrl = url;

            // defaults
            var data = {
                api_key: this.options.apiKey,
                limit: this.options.limit,
                offset: this.offset,
                type: 'audio'
            };

            // outgoing data
            var outgoing = {
                dataType: "jsonp", 
                data: data
            };

            return Backbone.Model.prototype.fetch.call(this, outgoing);
        },

        // Parse
        parse: function(response) {
            if(response.meta.msg === "OK") {
                var data = response.response;
                var posts = data.posts;
                var blog = data.blog || {};

                blog.avatar_url = '//api.tumblr.com/v2/blog/' + this.blogUrl + '/avatar/64';

                _.each(posts, function(post) {
                    // set artist if no artist exists
                    // used for soundcloud posts with no artist and
                    // track name Artist - Track Name...
                    if(!post.artist && post.track_name) {
                        var split = post.track_name.split('-');
                        post.artist = String(split[0]).replace(/^\s+|\s+$/g,'');
                        post.track_name = String(split[1]).replace(/^\s+|\s+$/g,'');

                        if(post.track_name === 'undefined') {
                            post.track_name = '';
                        }
                    }

                    if(!post.artist) {
                        post.artist = 'Unknown';
                    }

                    if(!post.track_name) {
                        post.track_name = 'Untitled';
                    }
                });

                data.blog = blog;
                data.posts = posts;

                console.log(data);

                this.set(data);
                this.offset += _.size(posts);
            }
        }

    });

    exports.TumblrModel = TumblrModel;
    
})(jQuery, _, Backbone, TumblrMusic);