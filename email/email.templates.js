

// This file is exporting an Object with a single key/value pair.
// However, because this is not a part of the logic of the application
// it makes sense to abstract it to another file. Plus, it is now easily 
// extensible if the application needs to send different email templates
// (eg. unsubscribe) in the future.
module.exports = {

  confirm: id => ({
    subject: 'myMed Επιβεβαίωση Λογαριασμού',
    html: `
      <div>Για να επιβεβαίωσετε τον λογαριασμό σας πατήστε τον παρακάτω σύνδεσμο.</div>
      <a href='http://localhost:3000/${id}/emailconfirmation'>
        πατήστε για να επιβεβαιώσετε το email
      </a>
      <div>Μην μοιραστείτε αυτό τον σύνδεσμο με κανέναν.</div>
    `,
    text: `Copy and paste this link:${process.env.LOGGIN_EMAIL_LINK}/${id}/emailconfirmation`
  })

}