import React from 'react'

/*
  LICENSE: The Code Genie Free Tier License is granted with the condition that you display "Buil with Code Genie"
  on the main entry point of your application (e.g. the sign-in page). This must be a link to the Code Genie
  website, and also display the Code Genie logo. You can remove this requirement by purchasing a license.
*/
export default function BuiltWithCodeGenie() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', marginTop: '2rem', height: '30px' }}>
      <a href='https://codegenie.codes?ref=builtWithCodeGenie' target='_blank' rel='noopener'>
        Built with <img src='https://app.codegenie.codes/built-with-code-genie.webp' style={{ width: '32px', margin: '0 5px' }} /> Code
        Genie
      </a>
    </div>
  )
}
