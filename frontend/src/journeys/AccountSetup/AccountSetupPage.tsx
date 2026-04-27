import {CheckingState} from './components/checkingState/CheckingState';
import {ErrorState} from './components/errorState/ErrorState';
import {HelpState} from './components/helpState/HelpState';
import {LinkingState} from './components/linkingState/LinkingState';
import {RedirectState} from './components/redirectState/RedirectState';
import {SuccessState} from './components/successState/SuccessState';
import {useAccountSetupPage} from './useAccountSetupPage';

export function AccountSetupPage() {
    const {
        step,
        linkDetails,
        userName,
        userInitials,
        goToLinking,
        goToHelp,
        goBackToError,
        goToRedirect,
        goToError,
        goToSuccess,
        retryLinking,
        navigateToBankConnection
    } = useAccountSetupPage();

    if (step === 'checking') return <CheckingState onAdvance={goToLinking}/>;
    if (step === 'linking') return <LinkingState userName={userName} userInitials={userInitials} onSuccess={goToSuccess}
                                                 onError={goToError}/>;
    if (step === 'success' && linkDetails) return <SuccessState details={linkDetails} onContinue={goToRedirect}/>;
    if (step === 'error' && linkDetails) return <ErrorState details={linkDetails} onRetry={retryLinking}
                                                            onHelp={goToHelp}/>;
    if (step === 'help') return <HelpState onBack={goBackToError}/>;
    if (step === 'redirect') return <RedirectState onAdvance={navigateToBankConnection}/>;
    return null;
}
