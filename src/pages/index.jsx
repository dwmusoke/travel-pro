import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import GDSManagement from "./GDSManagement";

import Invoicing from "./Invoicing";

import TicketTracker from "./TicketTracker";

import ClientCRM from "./ClientCRM";

import Reports from "./Reports";

import Billing from "./Billing";

import Workflows from "./Workflows";

import Sales from "./Sales";

import BSPReconciliation from "./BSPReconciliation";

import FinancialManagement from "./FinancialManagement";

import SuperAdmin from "./SuperAdmin";

import Home from "./Home";

import AgencySettings from "./AgencySettings";

import PlatformSettings from "./PlatformSettings";

import InvoiceEditor from "./InvoiceEditor";

import EstimateEditor from "./EstimateEditor";

import EmailProcessor from "./EmailProcessor";

import ServiceRules from "./ServiceRules";

import SystemAnalytics from "./SystemAnalytics";

import SystemLogs from "./SystemLogs";

import AgencyManagement from "./AgencyManagement";

import UserManagement from "./UserManagement";

import AgencyUserManagement from "./AgencyUserManagement";

import GetStarted from "./GetStarted";

import BillingConfirmation from "./BillingConfirmation";

import PNRParser from "./PNRParser";

import Services from "./Services";

import InvoiceDemo from "./InvoiceDemo";
import TestMode from "./TestMode";
import Base44Callback from "./Base44Callback";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    GDSManagement: GDSManagement,
    
    Invoicing: Invoicing,
    
    TicketTracker: TicketTracker,
    
    ClientCRM: ClientCRM,
    
    Reports: Reports,
    
    Billing: Billing,
    
    Workflows: Workflows,
    
    Sales: Sales,
    
    BSPReconciliation: BSPReconciliation,
    
    FinancialManagement: FinancialManagement,
    
    SuperAdmin: SuperAdmin,
    
    Home: Home,
    
    AgencySettings: AgencySettings,
    
    PlatformSettings: PlatformSettings,
    
    InvoiceEditor: InvoiceEditor,
    
    EstimateEditor: EstimateEditor,
    
    EmailProcessor: EmailProcessor,
    
    ServiceRules: ServiceRules,
    
    SystemAnalytics: SystemAnalytics,
    
    SystemLogs: SystemLogs,
    
    AgencyManagement: AgencyManagement,
    
    UserManagement: UserManagement,
    
    AgencyUserManagement: AgencyUserManagement,
    
    GetStarted: GetStarted,
    
    BillingConfirmation: BillingConfirmation,
    
    PNRParser: PNRParser,
    
    Services: Services,
    
    InvoiceDemo: InvoiceDemo,
    TestMode: TestMode,
    Base44Callback: Base44Callback,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    console.log('Current location:', location.pathname);
    console.log('Current page:', currentPage);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<Dashboard />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/GDSManagement" element={<GDSManagement />} />
                <Route path="/Invoicing" element={<Invoicing />} />
                <Route path="/TicketTracker" element={<TicketTracker />} />
                <Route path="/ClientCRM" element={<ClientCRM />} />
                <Route path="/Reports" element={<Reports />} />
                <Route path="/Billing" element={<Billing />} />
                <Route path="/Workflows" element={<Workflows />} />
                <Route path="/Sales" element={<Sales />} />
                <Route path="/BSPReconciliation" element={<BSPReconciliation />} />
                <Route path="/FinancialManagement" element={<FinancialManagement />} />
                <Route path="/SuperAdmin" element={<SuperAdmin />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/AgencySettings" element={<AgencySettings />} />
                <Route path="/PlatformSettings" element={<PlatformSettings />} />
                <Route path="/InvoiceEditor" element={<InvoiceEditor />} />
                <Route path="/EstimateEditor" element={<EstimateEditor />} />
                <Route path="/EmailProcessor" element={<EmailProcessor />} />
                <Route path="/ServiceRules" element={<ServiceRules />} />
                <Route path="/SystemAnalytics" element={<SystemAnalytics />} />
                <Route path="/SystemLogs" element={<SystemLogs />} />
                <Route path="/AgencyManagement" element={<AgencyManagement />} />
                <Route path="/UserManagement" element={<UserManagement />} />
                <Route path="/AgencyUserManagement" element={<AgencyUserManagement />} />
                <Route path="/GetStarted" element={<GetStarted />} />
                <Route path="/BillingConfirmation" element={<BillingConfirmation />} />
                <Route path="/PNRParser" element={<PNRParser />} />
                <Route path="/Services" element={<Services />} />
                <Route path="/TestMode" element={<TestMode />} />
                <Route path="/callback" element={<Base44Callback />} />
                
                {/* Catch-all route for any unmatched paths */}
                <Route path="*" element={
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                        <p>Current path: {location.pathname}</p>
                        <a href="/" style={{ color: '#007bff' }}>Go to Dashboard</a>
                    </div>
                } />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}