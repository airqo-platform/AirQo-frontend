import React from 'react'
import { isAndroid, isIOS } from 'react-device-detect';

const QRCodeRedirect = () => {
    const redirectUser = isAndroid ? 'https://play.google.com/store/apps/details?id=com.airqo.app' : isIOS ? 'https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091' : 'https://www.airqo.net/explore-data/download-apps'
    console.log('Redirect', redirectUser)
    return (
        <a href={redirectUser} rel="noopener noreferrer"></a>
    )
}

export default QRCodeRedirect;