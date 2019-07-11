/**
 * user permissions
 * ---
 * specifies a users permissions
 * @namespace permissions
 * @memberof module:api/user
 **/

/**
 * @typedef {(
 * 'ADMIN_SERVER'|
 * 'ADMIN_USER'|
 * 'UPLOAD_FILE'|
 * 'DELETE_FILE'|
 * 'MODIFY_FILE'|
 * 'ADMIN_FILE'
 * )} Key
 */

/**
 * a collection of permission keys and their description
 * @exports module:user/permissions.keys
 */
module.exports.keys = {
  'ADMIN_SERVER': [
    'allows to configure the server'
  ],

  'ADMIN_USER': [
    'allows to create, delete and modify user accounts',
    'includes to set permissions'
  ],

  'UPLOAD_FILE': [
    'allows to upload a file'
  ],
  'VIEW_FILE': [
    'allows to view all files uploaded by that user'
  ],
  'DELETE_FILE': [
    'allows to delete files that have been uploaded by that user'
  ],
  'MODIFY_FILE': [
    'allows to modify files that have been uploaded by that user',
    'includes to set permissions for that file'
  ],

  'ADMIN_FILE': [
    'allows to administrate all files on the system',
    'including deletion and modification'
  ]
};