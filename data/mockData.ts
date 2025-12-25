
import { ClinicalData, TrialSite } from "../types";

export const INITIAL_SITES: TrialSite[] = [
  {
    id: 'S001',
    name: 'Metropolis General Hospital',
    location: 'New York, NY',
    enrollmentRate: 2.5,
    screenFailRate: 15,
    openQueries: 12,
    queryAgingDays: 4.5,
    riskScore: 25,
    status: 'Active',
    lastMonitorVisit: '2024-10-15',
    protocolDeviations: 2
  },
  {
    id: 'S002',
    name: 'Gotham Health Science Center',
    location: 'Chicago, IL',
    enrollmentRate: 0.8,
    screenFailRate: 45,
    openQueries: 48,
    queryAgingDays: 14.2,
    riskScore: 78,
    status: 'At Risk',
    lastMonitorVisit: '2024-09-01',
    protocolDeviations: 18
  },
  {
    id: 'S003',
    name: 'Pacific Medical Labs',
    location: 'San Francisco, CA',
    enrollmentRate: 1.8,
    screenFailRate: 22,
    openQueries: 5,
    queryAgingDays: 1.5,
    riskScore: 12,
    status: 'Active',
    lastMonitorVisit: '2024-11-20',
    protocolDeviations: 0
  },
  {
    id: 'S004',
    name: 'EuroClinic Research',
    location: 'Berlin, DE',
    enrollmentRate: 3.2,
    screenFailRate: 10,
    openQueries: 22,
    queryAgingDays: 6.8,
    riskScore: 45,
    status: 'Active',
    lastMonitorVisit: '2024-10-28',
    protocolDeviations: 4
  }
];

export const MOCK_CLINICAL_DATA: ClinicalData = {
  sites: INITIAL_SITES,
  totalSubjects: 450,
  targetSubjects: 1200,
  totalQueries: 87,
  totalDeviations: 24,
  lastUpdated: new Date().toISOString()
};
