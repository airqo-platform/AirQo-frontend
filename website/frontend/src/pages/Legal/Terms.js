import React, { useEffect, useState } from 'react';
import { useInitScrollTop } from 'utils/customHooks';
import Page from '../Page';

const Terms = () => {
    useInitScrollTop();
    const [showMore, setShowMore] = useState(false);
    const show = () => {
        const getIds = document.getElementsByClassName('show-more')
        if (!showMore) {
            getIds[0].style.display = 'none'
            getIds[1].style.display = 'none'
            getIds[2].style.display = 'none'
            getIds[3].style.display = 'none'
            getIds[4].style.display = 'none'
            getIds[5].style.display = 'none'
            getIds[6].style.display = 'none'
            getIds[7].style.display = 'none'
            getIds[8].style.display = 'none'
            getIds[9].style.display = 'none'
            getIds[10].style.display = 'none'
            getIds[11].style.display = 'none'
        }
        else {
            getIds[0].style.display = 'contents'
            getIds[1].style.display = 'contents'
            getIds[2].style.display = 'contents'
            getIds[3].style.display = 'contents'
            getIds[4].style.display = 'contents'
            getIds[5].style.display = 'contents'
            getIds[6].style.display = 'contents'
            getIds[7].style.display = 'contents'
            getIds[8].style.display = 'contents'
            getIds[9].style.display = 'contents'
            getIds[10].style.display = 'contents'
            getIds[11].style.display = 'contents'
        }
    }

    useEffect(()=>{
        show();
    })
    return (
        <Page>
            <div className="tos-page">
                <div className="tos-header">
                    <div className="content">
                        <div className="tos-top">
                            <h2>Legal</h2>
                            <div className="header-nav">
                                <span id="tab1">
                                    <button className="selected">Terms of Service</button>
                                </span>
                                <span id="tab2">
                                    <button className="unselected">Privacy Policy</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tos-body">
                    <div className="content">
                        <div className="tos-sub">
                            <div className="sidenav">
                                <div><a href="#intro" className="active">Introduction</a></div>
                                <div><a href="#credit">Credit</a></div>
                                <div><a href="#copyright">Copyright Notice</a></div>
                                <div><a href="#ltup">Licence to use platform</a></div>
                                <div><a href="#au">Acceptance Use</a></div>
                                <div><a href="#raa">Registration and Accounts</a></div>
                                <div><a href="#uld">User Login Details</a></div>
                                <div><a href="#casof">Cancellation & Suspension of account</a></div>
                                <div><a href="#ycl">Your Content: Licence</a></div>
                                <div><a href="#lw">Limited Warranties</a></div>
                                <div><a href="#lae">Limitations & Exclusions</a></div>
                                <div><a href="#botc">Breaches of these Conditions</a></div>
                                <div><a href="#variation">Variation</a></div>
                                <div><a href="#assignment">Assignment</a></div>
                                <div><a href="#severability">Severability</a></div>
                                <div><a href="#tpr">Third Party Rights</a></div>
                                <div><a href="#ea">Entire Agreement</a></div>
                                <div><a href="#laj">Law and Jurisdiction</a></div>
                                <div><a href="#details">Our Details</a></div>
                            </div>
                            <div className="tos-wording">
                                <div id="intro" className='show-first'>
                                    <h2>Introduction</h2>
                                    <ol>
                                        <li>Some cities already have programs for air quality monitoring, so we collaborate with them on how to increase their coverage network. </li>
                                        <li>By using our platform, you accept these terms and conditions in full; accordingly, if you disagree with these terms and conditions or any part of these terms and conditions, you must not use our platform.</li>
                                        <li>If you register with our platform, submit any material to our platform or use any of our platform services, we will ask you to expressly agree to these terms and conditions.</li>
                                        <li>Our platform uses cookies; by using our platform or agreeing to these terms and conditions, you consent to our use of cookies in accordance with the terms of our Privacy and cookies policy.</li>
                                    </ol>
                                </div>
                                <div id="credit" className='show-first'>
                                    <h2>Credit</h2>
                                    <ol>
                                        <p>This document was created using a template from SEQ Legal (https://seqlegal.com).</p>
                                    </ol>
                                </div>
                                <div id="copyright" className='show-first'>
                                    <h2>Copyright Notice</h2>
                                    <ol>
                                        <li>Copyright (c) 2020 AirQo, College of Computing and Information Sciences, Makerere University.</li>
                                        <li>Subject to the express provisions of these terms and conditions:</li>
                                        <p>a. We, together with our licensors, own and control all the copyright and other intellectual property rights in our platform and the material on our platform; and</p>
                                        <p>b. All the copyright and other intellectual property rights in our platform and the material on our platform are reserved.</p>
                                    </ol>
                                </div>
                                <div id="ltup" className='show-first'>
                                    <h2>Licence to use platform</h2>
                                    <ol>
                                        <p><b>4.1 You may:</b></p>
                                        <li>view pages from our platform in a web browser;</li>
                                        <li>download pages from our platform for caching in a web browser;</li>
                                        <li>print pages from our platform;</li>
                                        <li>If observational data are used for analyses, displayed on web pages, or used for other programs or products, the analysis results, displays, or products must indicate that these data are indicative and not fully verified or validated;</li>
                                        <li>Publications, analyses, products, presentations, and/or derived information that rely on these data must give attribution to the originating data provider named on the data as well as AirQo, subject to the other provisions of these terms and conditions.</li>

                                        <p><b>4.2 You may only use our platform for your own personal use,</b> academic research, government policy research and development, charitable and public awareness raising, and you must not use our platform for any other purposes.</p>

                                        <p><b>4.4 Except as expressly permitted by these terms and conditions,</b> you must not edit or otherwise modify any material on our platform.</p>

                                        <p><b>4.5 Unless you own or control the relevant rights in the material, you must not:</b><br />
                                            republish material from our platform (including republication on another platform);
                                            sell, rent or sub-license material from our platform; or
                                            exploit material from our platform for a commercial purpose.
                                        </p>

                                        <p><b>4.6 Notwithstanding Section 4.5,</b> you may redistribute our newsletter or blog posts in print and electronic form to any person.</p>

                                        <p><b>4.7 We reserve the right to restrict access to areas of our platform,</b> or indeed our whole platform, at our discretion; you must not circumvent or bypass, or attempt to circumvent or bypass, any access restriction measures on our platform.</p>
                                    </ol>
                                </div>
                                <div id="au" className='show-first'>
                                    <h2>Acceptance Use</h2>
                                    <ol>
                                        <p><b>You must not:</b></p>
                                        <li>use our platform in any way or take any action that causes, or may cause, damage to the platform or impairment of the performance, availability or accessibility of the platform;</li>
                                        <li>use our platform in any way that is unlawful, illegal, fraudulent or harmful, or in connection with any unlawful, illegal, fraudulent or harmful purpose or activity;</li>
                                        <li>use our platform to copy, store, host, transmit, send, use, publish or distribute any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, keystroke logger, rootkit or other malicious computer software;</li>
                                        <li>conduct any systematic or automated data collection activities (including without limitation scraping, data mining, data extraction and data harvesting) on or in relation to our platform without our express written consent or via registered use of our API or other data export, visualisation export or reporting tools provided for this purpose on our platform.</li>
                                        <li>use data collected from our platform for any direct marketing activity (including without limitation email marketing, SMS marketing, telemarketing and direct mailing).</li>
                                        <li>You must not use data collected from our platform to contact individuals, companies or other persons or entities unless specific links or contact details have been provided on the platform.</li>
                                    </ol>
                                </div>
                                <div id="raa" className='show-first'>
                                    <h2>Registration and accounts</h2>
                                    <ol>
                                        <li>You may register for an account with our platform by completing and submitting the account registration form on our platform, and clicking on the verification link in the email that the platform will send to you.</li>
                                        <li>You must ensure that all the information you supply to us through our platform in relation to your intended use of our content and your affiliations is true, accurate, current, complete and non-misleading.</li>
                                        <li>You must not allow any other person to use your account to access the platform.</li>
                                        <li>You must notify us in writing immediately if you become aware of any unauthorised use of your account.</li>
                                        <li>You must not use any other person's account to access the platform, unless you have that person's express permission to do so.</li>
                                    </ol>
                                </div>
                                <div id="uld" className='show-first'>
                                    <h2>User Login details</h2>
                                    <ol>
                                        <li>If you register for an account with our platform, we will provide you with, or you will be asked to choose a user ID and password.</li>
                                        <li>If you register for an account with our platform, we will provide you with, or you will be asked to choose a user ID and password.</li>
                                        <li>If you register for an account with our platform, we will provide you with, or you will be asked to choose a user ID and password.</li>
                                        <li>You must notify us in writing immediately if you become aware of any disclosure of your password.</li>
                                        <li>You are responsible for any activity on our platform arising out of any failure to keep your password confidential, and may be held liable for any losses arising out of such a failure.</li>
                                    </ol>
                                </div>
                                <div id="casoa" className='show-more'>
                                    <h2>Cancellation and suspension of account</h2>
                                    <ol>
                                        <p>We may:</p>
                                        <li>suspend your account;</li>
                                        <li>cancel your account; and/or</li>
                                        <li>edit your account details, at any time in our sole discretion without notice or explanation.</li>
                                    </ol>
                                </div>
                                <div id="ycl" className='show-more'>
                                    <h2>Your content: licence</h2>
                                    <ol>
                                        <li>You warrant and represent that your content will comply with these terms and conditions.</li>
                                        <li>Your content must not be illegal or unlawful, must not infringe any person's legal rights, and must not be capable of giving rise to legal action against any person (in each case in any jurisdiction and under any applicable law).</li>
                                        <li>Your content, and the use of your content by us in accordance with these terms and conditions, must not:</li>
                                        <li className="bulleted">be libellous or maliciously false;</li>
                                        <li className="bulleted">be obscene or indecent;</li>
                                        <li className="bulleted">infringe any copyright, moral right, database right, trade mark right, design right, right in passing off, or other intellectual property right;</li>
                                        <li className="bulleted">infringe any right of confidence, right of privacy or right under data protection legislation.</li>
                                        <li className="bulleted">constitute negligent advice or contain any negligent statement;</li>
                                        <li className="bulleted">be in contempt of any court, or in breach of any court order;</li>
                                        <li className="bulleted">be in breach of racial or religious hatred or discrimination legislation;</li>
                                        <li className="bulleted">be in breach of official secrets legislation;</li>
                                        <li className="bulleted">be in breach of any contractual obligation owed to any person.</li>
                                    </ol>
                                </div>
                                <div id="lw" className='show-more'>
                                    <h2>Limited warranties</h2>
                                    <ol>
                                        <li>We do not warrant or represent:<br />the completeness or accuracy of the information published on our platform. The data available on the platform are indicative and while efforts are made to provide accurate data they are not fully verified or validated; these data are subject to change, error, and correction. The data and information are not presented as an official record<br /><br />the functionality or reliability of products in development and labelled as ‘beta’ versions which are released for trial purposes only and may be discontinued at any time;<br /><br />that the material on the platform is up to date; or<br /><br />that the platform or any service on the platform will remain available.</li>
                                        <li>We reserve the right to discontinue or alter any or all of our platform services, and to stop publishing our platform, at any time in our sole discretion without notice or explanation; and save to the extent expressly provided otherwise in these terms and conditions, you will not be entitled to any compensation or other payment upon the discontinuance or alteration of any platform services, or if we stop publishing the platform.</li>
                                        <li>To the maximum extent permitted by applicable law and subject to Section 12.1, we exclude all representations and warranties relating to the subject matter of these terms and conditions, our platform and the use of our platform.</li>
                                    </ol>
                                </div>
                                <div id="lae" className='show-more'>
                                    <h2>Limitations and exclusions of liability</h2>
                                    <ol>
                                        <p>Nothing in these terms and conditions will:</p>
                                        <li className="bulleted">limit or exclude any liability for death or personal injury resulting from negligence;</li>
                                        <li className="bulleted">limit or exclude any liability for fraud or fraudulent misrepresentation;</li>
                                        <li className="bulleted">limit any liabilities in any way that is not permitted under applicable law; or</li>
                                        <li className="bulleted">exclude any liabilities that may not be excluded under applicable law.</li>
                                        <p>The limitations and exclusions of liability set out in this Section 12 and elsewhere in these terms and conditions:</p>
                                        <li className="bulleted">are subject to Section 12.1; and</li>
                                        <li className="bulleted">govern all liabilities arising under these terms and conditions or relating to the subject matter of these terms and conditions, including liabilities arising in contract, in tort (including negligence) and for breach of statutory duty, except to the extent expressly provided otherwise in these terms and conditions.</li>
                                        <p>To the extent that our platform and the information and services on our platform are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
                                        <p>We will not be liable to you in respect of any losses arising out of any event or events beyond our reasonable control.</p>
                                        <p>We will not be liable to you in respect of any business losses, including (without limitation) loss of or damage to profits, income, revenue, use, production, anticipated savings, business, contracts, commercial opportunities or goodwill.</p>
                                        <p>We will not be liable to you in respect of any loss or corruption of any data, database or software.</p>
                                        <p>We will not be liable to you in respect of any special, indirect or consequential loss or damage.</p>
                                    </ol>
                                </div>
                                <div id="botc" className='show-more'>
                                    <h2>Breaches of these terms and conditions</h2>
                                    <ol>
                                        <p>Without prejudice to our other rights under these terms and conditions, if you breach these terms and conditions in any way, or if we reasonably suspect that you have breached these terms and conditions in any way, we may:</p>
                                        <li>send you one or more formal warnings;</li>
                                        <li>temporarily suspend your access to our platform;</li>
                                        <li>permanently prohibit you from accessing our platform;</li>
                                        <li>block computers using your IP address from accessing our platform;</li>
                                        <li>contact any or all of your internet service providers and request that they block your access to our platform;</li>
                                        <li>commence legal action against you, whether for breach of contract or otherwise; and/or</li>
                                        <li>suspend or delete your account on our platform.</li>
                                    </ol>
                                </div>
                                <div id="variation" className='show-more'>
                                    <h2>Variation</h2>
                                    <ol>
                                        <p>We may revise these terms and conditions from time to time.</p>
                                        <p>The revised terms and conditions shall apply to the use of our platform from the date of publication of the revised terms and conditions on the platform, and you hereby waive any right you may otherwise have to be notified of, or to consent to, revisions of these terms and conditions.</p>
                                    </ol>
                                </div>
                                <div id="assignment" className='show-more'>
                                    <h2>assignment</h2>
                                    <ol>
                                        <p>You hereby agree that we may assign, transfer, sub-contract or otherwise deal with our rights and/or obligations under these terms and conditions.</p>
                                        <p>You may not without our prior written consent assign, transfer, sub-contract or otherwise deal with any of your rights and/or obligations under these terms and conditions.</p>
                                    </ol>
                                </div>
                                <div id="severability" className='show-more'>
                                    <h2>Severability</h2>
                                    <ol>
                                        <p>If a provision of these terms and conditions is determined by any court or other competent authority to be unlawful and/or unenforceable, the other provisions will continue in effect.</p>
                                        <p>If any unlawful and/or unenforceable provision of these terms and conditions would be lawful or enforceable if part of it were deleted, that part will be deemed to be deleted, and the rest of the provision will continue in effect.</p>
                                    </ol>
                                </div>
                                <div id="tpr" className='show-more'>
                                    <h2>Third party rights</h2>
                                    <ol>
                                        <p>A contract under these terms and conditions is for our benefit and your benefit, and is not intended to benefit or be enforceable by any third party.</p>
                                        <p>The exercise of the parties' rights under a contract under these terms and conditions is not subject to the consent of any third party.</p>
                                        <p>Our platform allows users to use the services of some third party applications such as Google maps or Open Street Map. When using these services users are bound by the providers Terms and Conditions and AirQo accepts no liability for user breech of these terms and conditions or the performance of these services.</p>
                                    </ol>
                                </div>
                                <div id="ea" className='show-more'>
                                    <h2>Entire Agreement</h2>
                                    <ol>
                                        <p>Subject to Section 12.1, these terms and conditions, together with our privacy and cookies policy, shall constitute the entire agreement between you and us in relation to your use of our platform and shall supersede all previous agreements between you and us in relation to your use of our platform.</p>
                                    </ol>
                                </div>
                                <div id="laj" className='show-more'>
                                    <h2>Law and jurisdiction</h2>
                                    <ol>
                                        <p>These terms and conditions shall be governed by and construed in accordance with Ugandan law.</p>
                                        <p>Any disputes relating to these terms and conditions shall be subject to the non-exclusive jurisdiction of the courts of Uganda.</p>
                                    </ol>
                                </div>
                                <div id="details" className='show-more'>
                                    <h2>Our details</h2>
                                    <ol>
                                        <p>This platform is owned and operated by College of Computing and Information Sciences, Makerere University, Kampala, Uganda.</p>
                                        <p>Our principal place of business is at Software Systems Centre, Block B, Level 3, College of Computing and Information Sciences, Plot 56 University Pool Road Makerere University, Kampala, Uganda.</p>
                                        <p>You can contact us:</p>
                                        <p>using our platform contact form at www.airqo.net</p>
                                        <p>by email, using info@airqo.net.</p>
                                    </ol>
                                </div>
                                {
                                    <div id="show-more">
                                        <button className='btn' onClick={() => { show(); setShowMore(!showMore) }}>
                                            {showMore ? "less" : "more"}
                                        </button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default Terms;
