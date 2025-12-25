
export interface TrialSite {
  id: string;
  name: string;
  location: string;
  enrollmentRate: number;
  screenFailRate: number;
  openQueries: number;
  queryAgingDays: number;
  riskScore: number; // 0-100
  status: 'Active' | 'Closed' | 'Initiating' | 'At Risk';
  lastMonitorVisit: string;
  protocolDeviations: number;
}

export interface ClinicalData {
  sites: TrialSite[];
  totalSubjects: number;
  targetSubjects: number;
  totalQueries: number;
  totalDeviations: number;
  lastUpdated: string;
}

export interface AgentInsight {
  id: string;
  agentName: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  suggestedAction: string;
  sourceData: string[];
}

export enum AgentType {
  DATA_QUALITY = 'Data Quality Agent',
  OPERATIONAL_RISK = 'Operational Risk Agent',
  CRA_ASSISTANT = 'CRA Assistant Agent',
  CTT_STRATEGY = 'CTT Strategy Agent'
}
