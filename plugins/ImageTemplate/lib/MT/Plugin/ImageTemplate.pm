package MT::Plugin::ImageTemplate;

use strict;
use warnings;
use utf8;

use File::Basename qw(basename dirname);

sub component {
    __PACKAGE__ =~ m/::([^:]+)\z/;
}

sub plugin {
    MT->component( component() );
}

sub insert_after {
    my ( $tmpl, $id, $tokens ) = @_;

    my $before = $id ? $tmpl->getElementById($id) : undef;
    if ( $id && !$before ) {
        $before = $tmpl->getElementsByName($id)->[0];
    }

    if ( !ref $tokens ) {
        $tokens = plugin()->load_tmpl($tokens)->tokens;
    }

    foreach my $t (@$tokens) {
        $tmpl->insertAfter( $t, $before );
        $before = $t;
    }
}

our $force_template_map;

sub init_app {
    require Class::Method::Modifiers;
    Class::Method::Modifiers::around(
        'MT::Object::load',
        sub {
            my $orig  = shift;
            my $model = shift;

            if ( $force_template_map && $model eq 'MT::TemplateMap' ) {
                return MT->model('templatemap')->new(
                    {   archive_type => '',
                        is_preferred => 1,
                        template_id  => $force_template_map,
                    }
                );
            }

            $model->$orig(@_);
        }
    );

}

sub template_param_asset_modal {
    my ( $cb, $app, $param, $tmpl ) = @_;

    my $static_path = do {
        my $plugin      = plugin();
        my $static      = $app->static_path;
        my $plugin_name = basename( $plugin->{full_path} );
        my $dir         = basename( dirname( $plugin->{full_path} ) );
        "$static$dir/$plugin_name";
    };
    my $version = plugin()->version;

    insert_after( $tmpl, 'modal_body', 'asset_modal.tmpl' );
    insert_after(
        $tmpl,
        'modal_body',
        [   $tmpl->createElement(
                'var',
                {   name  => 'plugin_image_template_static_path',
                    value => $static_path,
                }
            ),
            $tmpl->createElement(
                'var',
                {   name  => 'plugin_image_template_version',
                    value => $version,
                }
            ),
        ]
    );
}

sub get_templates {
    my ($app) = @_;

    return $app->permission_denied()
        unless $app->can_do('create_new_entry');

    my $model = $app->param('_type')
        or die;
    my $content_type_id = $app->param('content_type_id') || 0; 

    my @templates = $app->model('template')->load(
        {   blog_id => $app->blog->id,
            type    => 'custom',
            name    => $model eq 'content_data'
                ? { like => "image_template_${model}_${content_type_id}_%" }
                : { like => "image_template_${model}_%" },
        },
        {   sort      => 'name',
            direction => 'ascend',
        }
    );

    $app->json_result(
        [   map {
                my $tmpl = $_;
                my $name = $tmpl->name;
                if ($model eq 'content_data') {
                    $name =~ s/^image_template_${model}_${content_type_id}_\d+_//;
                }
                else {
                    $name =~ s/^image_template_${model}_\d+_//;
                }
                +{
                    id => $tmpl->id,
                    name => $name,
                };
            } @templates
        ]
    );
}

sub generate_source {
    my ($app) = @_;

    return $app->permission_denied()
        unless $app->can_do('create_new_entry');

    require MT::CMS::Entry;
    require MT::CMS::ContentData;
    my $blog = $app->blog;
    my $model = $app->param('_type')
        or die;
    my $content_type_id = $app->param('content_type_id') || 0;

    my $image_template_id = $app->param('image_template_id')
        or die;
    my $tmpl = $app->model('template')->load(
        {   id      => $image_template_id,
            blog_id => $blog->id,
            type    => 'custom',
            name    => { like => "image_template_${model}_%" },
        }
        );

    my $ctx = $tmpl->context;
    $ctx->stash( 'blog', $blog );
    $ctx->stash( 'blog_id', $blog->id );

    if ($model eq 'content_data') {
        my $content_type = 
        my $content_data = MT::CMS::ContentData::_create_temp_content_data($app);
        $ctx->stash( 'content',      $content_data );
        $ctx->stash( 'content_type', $content_data->content_type );
    }
    else {
        my $entry = MT::CMS::Entry::_create_temp_entry($app)
            or die;
        $ctx->stash( 'entry', $entry );
    }

    $app->json_result( $tmpl->output );
}

1;
