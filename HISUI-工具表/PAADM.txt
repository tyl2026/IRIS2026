/// Admission                (PAADM,83)
Class User.PAAdm Extends (%Persistent, User.Abstract) [ ClassType = persistent, Inheritance = right, Not ProcedureBlock, SqlTableName = PA_Adm, StorageStrategy = SQLStorage ]
{

Relationship ChildPAAdmLab As PAAdmLab [ Cardinality = children, Inverse = ALBPAADMParRef ];

Relationship ChildORAnaesthesia As ORAnaesthesia [ Cardinality = children, Inverse = ANAPAADMParRef ];

Relationship ChildPAAdmLeave As PAAdmLeave [ Cardinality = children, Inverse = ADMLParRef ];

Relationship ChildPAAdmBloodBags As PAAdmBloodBags [ Cardinality = children, Inverse = BLDParRef ];

Relationship ChildPAAdmInsurance As PAAdmInsurance [ Cardinality = children, Inverse = INSParRef ];

Relationship ChildPAAdmTransaction As PAAdmTransaction [ Cardinality = children, Inverse = TRANSParRef ];

Relationship ChildPAAdmDietDetails As PAAdmDietDetails [ Cardinality = children, Inverse = DIETParRef ];

Relationship ChildPAAdmDepartment As PAAdmDepartment [ Cardinality = children, Inverse = DEPParRef ];

Relationship ChildPAAdmPriority As PAAdmPriority [ Cardinality = children, Inverse = PRIParRef ];

Relationship ChildPAAdmDocument As PAAdmDocument [ Cardinality = children, Inverse = DOCParRef ];

Relationship ChildPAAdmDrugApproval As PAAdmDrugApproval [ Cardinality = children, Inverse = DRUGParRef ];

Relationship ChildPAAdmCopaymentCodes As PAAdmCopaymentCodes [ Cardinality = children, Inverse = COPCParRef ];

Relationship ChildPAAdmAnaestComplications As PAAdmAnaestComplications [ Cardinality = children, Inverse = ANCParREf ];

Relationship ChildPAAdmContactPerson As PAAdmContactPerson [ Cardinality = children, Inverse = CONTParRef ];

Relationship ChildPAAdmReferralLocation As PAAdmReferralLocation [ Cardinality = children, Inverse = REFLOCParRef ];

Relationship ChildPAAdmAugmentedCare As PAAdmAugmentedCare [ Cardinality = children, Inverse = AUGParRef ];

Relationship ChildPAAdmReasonDelayDisch As PAAdmReasonDelayDisch [ Cardinality = children, Inverse = READELParRef ];

Relationship ChildPAAdmMedFit As PAAdmMedFit [ Cardinality = children, Inverse = MFParRef ];

Relationship ChildPAAdmEstDischargeHistory As PAAdmEstDischargeHistory [ Cardinality = children, Inverse = ESTDISParRef ];

Relationship ChildPAAdmCoding As PAAdmCoding [ Cardinality = children, Inverse = CODParRef ];

Relationship ChildPAAdmRefDoc As PAAdmRefDoc [ Cardinality = children, Inverse = REFDParRef ];

Relationship ChildPAAdmLoc As PAAdmLoc [ Cardinality = children, Inverse = LOCParRef ];

Relationship ChildPAAdmSepRef As PAAdmSepRef [ Cardinality = children, Inverse = SEPREFParRef ];

Relationship ChildPAAdmWardAttend As PAAdmWardAttend [ Cardinality = children, Inverse = WATParRef ];

Relationship ChildPAAdmUnavailable As PAAdmUnavailable [ Cardinality = children, Inverse = UNAVParRef ];

Relationship ChildPAAdmViewableBy As PAAdmViewableBy [ Cardinality = children, Inverse = VIEWParRef ];

Relationship ChildPAAdmComments As PAAdmComments [ Cardinality = children, Inverse = CMTParRef ];

Relationship ChildPAAdmSNAP As PAAdmSNAP [ Cardinality = children, Inverse = SNAPParRef ];

Relationship ChildPAAdmContractedCare As PAAdmContractedCare [ Cardinality = children, Inverse = CONTCAREParRef ];

Relationship ChildPAAdmDocDetails As PAAdmDocDetails [ Cardinality = children, Inverse = AdmDocParRef ];

/// Admission No
Property PAADMADMNo As %String(COLLATION = "AlphaUp", MAXLEN = 99, TRUNCATE = 1) [ SqlColumnNumber = 2, SqlFieldName = PAADM_ADMNo ];

/// Des Ref to PAPMI
Property PAADMPAPMIDR As PAPatMas [ Required, SqlColumnNumber = 3, SqlFieldName = PAADM_PAPMI_DR ];

/// Not Used Des Ref to CTPTC
Property PAADMPatTypeDR As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 4, SqlFieldName = PAADM_PatType_DR ];

/// Des Ref to CTLOC
Property PAADMDepCodeDR As CTLoc [ Required, SqlColumnNumber = 5, SqlFieldName = PAADM_DepCode_DR ];

/// Des Ref to AdmCateg
Property PAADMAdmCategDR As PACAdmCategory [ SqlColumnNumber = 6, SqlFieldName = PAADM_AdmCateg_DR ];

/// Admission Date
Property PAADMAdmDate As %Date [ SqlColumnNumber = 7, SqlFieldName = PAADM_AdmDate ];

/// Admission Time
Property PAADMAdmTime As %Time [ SqlColumnNumber = 8, SqlFieldName = PAADM_AdmTime ];

/// Admission Type
Property PAADMType As %String(DISPLAYLIST = ",In Patient,Out Patient,Emergency,New Born,Health Promotion", MAXLEN = 16, TRUNCATE = 1, VALUELIST = ",I,O,E,N,H") [ Required, SqlColumnNumber = 9, SqlFieldName = PAADM_Type ];

/// Adm Source
Property PAADMAdmSrcDR As PACAdmSource [ SqlColumnNumber = 10, SqlFieldName = PAADM_AdmSrc_DR ];

/// Should the patient be charged for specialist
Property PAADMSpecialtyDR As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 11, SqlFieldName = PAADM_Specialty_DR ];

/// Des Ref to CTPCP
Property PAADMAdmDocCodeDR As CTCareProv [ SqlColumnNumber = 12, SqlFieldName = PAADM_AdmDocCodeDR ];

/// Des Ref to PACAR
Property PAADMSourceRefDR As PACAdmSourceRef [ SqlColumnNumber = 13, SqlFieldName = PAADM_SourceRef_DR ];

/// Expected Admission Date
Property PAADMExpAdmDate As %Date [ SqlColumnNumber = 14, SqlFieldName = PAADM_ExpAdmDate ];

/// Pre - Admitted
Property PAADMPreAdmitted As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ InitialExpression = "N", SqlColumnNumber = 15, SqlFieldName = PAADM_PreAdmitted ];

/// Ref Doctor Text
Property PAADMRefDocCodeDR As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 20, SqlFieldName = PAADM_RefDocCodeDR ];

/// Discharge Date
Property PAADMDischgDate As %Date [ SqlColumnNumber = 22, SqlFieldName = PAADM_DischgDate ];

/// Discharge Time
Property PAADMDischgTime As %Time [ SqlColumnNumber = 23, SqlFieldName = PAADM_DischgTime ];

/// Des Ref to CTPCP
Property PAADMDischgDocDR As CTCareProv [ SqlColumnNumber = 24, SqlFieldName = PAADM_DischgDoc_DR ];

/// Visit Status
Property PAADMVisitStatus As %String(DISPLAYLIST = ",Admit,Cancel,Discharged,Pre-Admission,Released,DNA", MAXLEN = 13, TRUNCATE = 1, VALUELIST = ",A,C,D,P,R,N") [ SqlColumnNumber = 25, SqlFieldName = PAADM_VisitStatus ];

/// Des Ref to CTDSP
Property PAADMDisposDR As CTDisposit [ SqlColumnNumber = 26, SqlFieldName = PAADM_Dispos_DR ];

/// Des Ref HCR
Property PAADMHCRDR As CTHealthCareRegion [ SqlColumnNumber = 27, SqlFieldName = PAADM_HCR_DR ];

/// TrafficAccident_DR
Property PAADMTrafficAccidentDR As PATrafficAccident [ SqlColumnNumber = 28, SqlFieldName = PAADM_TrafficAccident_DR ];

/// Show In Future Episode
Property PAADMShowInFutureEpisode As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 29, SqlFieldName = PAADM_ShowInFutureEpisode ];

/// Confidential Flag
Property PAADMConfidential As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ InitialExpression = "N", SqlColumnNumber = 34, SqlFieldName = PAADM_Confidential ];

/// Expected Length Of Stay 
Property PAADMExpLOS As %Float(MAXVAL = 999, MINVAL = 0) [ SqlColumnNumber = 68, SqlFieldName = PAADM_ExpLOS ];

/// Discharge Appointment for in patients des ref
Property PAADMDischargeAppointDR As RBAppointment [ SqlColumnNumber = 69, SqlFieldName = PAADM_DischargeAppoint_DR ];

/// Des Ref to CTRFC
Property PAADMRefClinicDR As CTRefClin [ SqlColumnNumber = 70, SqlFieldName = PAADM_RefClinic_DR ];

/// In Patient Number
Property PAADMInPatNo As %String(COLLATION = "AlphaUp", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 72, SqlFieldName = PAADM_InPatNo ];

/// Emergency Number
Property PAADMEmergencyNo As %String(COLLATION = "AlphaUp", MAXLEN = 10, TRUNCATE = 1) [ SqlColumnNumber = 74, SqlFieldName = PAADM_EmergencyNo ];

/// Pre Admission Number
Property PAADMPreAdmNo As %String(COLLATION = "AlphaUp", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 76, SqlFieldName = PAADM_PreAdmNo ];

/// Converted From Out Patient Episode
Property PAADMConvertedFromOut As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 77, SqlFieldName = PAADM_ConvertedFromOut ];

/// Que Priority
Property PAADMPriorityDR As CTAcuity [ SqlColumnNumber = 78, SqlFieldName = PAADM_Priority_DR ];

/// Pre Admit Date
Property PAADMPreAdmitDate As %Date [ SqlColumnNumber = 79, SqlFieldName = PAADM_PreAdmitDate ];

/// Pre Admit Time
Property PAADMPreAdmitTime As %Time [ SqlColumnNumber = 80, SqlFieldName = PAADM_PreAdmitTime ];

/// Isolate
Property PAADMIsolate As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ InitialExpression = "N", SqlColumnNumber = 81, SqlFieldName = PAADM_Isolate ];

/// Emergency Date
Property PAADMEmergencyDate As %Date [ SqlColumnNumber = 88, SqlFieldName = PAADM_EmergencyDate ];

/// Emergency Time
Property PAADMEmergencyTime As %Time [ SqlColumnNumber = 89, SqlFieldName = PAADM_EmergencyTime ];

/// Has the emergency surcharge been paid
Property PAADMPaidEmergencySurcharge As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 91, SqlFieldName = PAADM_PaidEmergencySurcharge ];

/// Original Admission
Property PAADMOriginalAdmissionDR As PAAdm [ InitialExpression = {$G(XFUNC("OP to IP"))}, SqlColumnNumber = 92, SqlFieldName = PAADM_OriginalAdmissionDR ];

/// Meal Preference
Property PAADMMealPreference As %String(COLLATION = "Exact", MAXLEN = 40, TRUNCATE = 1) [ SqlColumnNumber = 93, SqlFieldName = PAADM_MealPreference ];

/// Order
Property PAADMOrder As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 94, SqlFieldName = PAADM_Order, Transient ];

/// Create Date
Property PAADMCreateDate As %Date [ InitialExpression = {+$h}, SqlColumnNumber = 95, SqlFieldName = PAADM_CreateDate ];

/// Create Time
Property PAADMCreateTime As %Time [ InitialExpression = {$p($h,",",2)}, SqlColumnNumber = 96, SqlFieldName = PAADM_CreateTime ];

/// Create User
Property PAADMCreateUser As SSUser [ SqlColumnNumber = 97, SqlFieldName = PAADM_CreateUser ];

/// Comment
Property PAADMRemark As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 98, SqlFieldName = PAADM_Remark, SqlListType = SUBNODE ];

/// Current
Property PAADMCurrent As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 99, SqlComputeCode = { s {PAADM_Current}=$S("RDC"[{PAADM_VisitStatus}:"N",1:"Y")
}, SqlComputed, SqlFieldName = PAADM_Current, Transient ];

/// To indicate admission is financially dischag
Property PAADMBillFlag As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 100, SqlFieldName = PAADM_BillFlag ];

/// Referral Date
Property PAADMRefDate As %Date [ SqlColumnNumber = 136, SqlFieldName = PAADM_RefDate ];

/// Referral Expiry Date
Property PAADMRefExpiryDate As %Date [ SqlColumnNumber = 137, SqlFieldName = PAADM_RefExpiryDate ];

/// Referral Approval Number
Property PAADMRefApprovNo As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 138, SqlFieldName = PAADM_RefApprovNo ];

/// Type of Patient (Calculated)
Property PAADMTypeofPatientCalc As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 139, SqlFieldName = PAADM_Type_of_Patient_Calc ];

/// Estimated Discharge Date
Property PAADMEstimDischargeDate As %Date [ SqlColumnNumber = 140, SqlFieldName = PAADM_EstimDischargeDate ];

/// Estimated Discharge Time
Property PAADMEstimDischargeTime As %Time [ SqlColumnNumber = 141, SqlFieldName = PAADM_EstimDischargeTime ];

/// Des Ref to PACDischCond
Property PAADMDischCondDR As PACDischCondit [ SqlColumnNumber = 142, SqlFieldName = PAADM_DischCond_DR ];

/// Other Discharge Type
Property PAADMOtherDischType As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 143, SqlFieldName = PAADM_OtherDischType ];

/// Des Ref to PACInfect
Property PAADMInfectDR As PACInfectionType [ SqlColumnNumber = 144, SqlFieldName = PAADM_Infect_DR ];

/// Other Infection Type
Property PAADMOtherInfectType As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 145, SqlFieldName = PAADM_OtherInfectType ];

/// Estimated Operation Date
Property PAADMEstimOperDate As %Date [ SqlColumnNumber = 146, SqlFieldName = PAADM_EstimOperDate ];

/// Des Ref to ORCOper
Property PAADMOperDR As ORCOperation [ SqlColumnNumber = 147, SqlFieldName = PAADM_Oper_DR ];

/// Urgent
Property PAADMUrgent As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 148, SqlFieldName = PAADM_Urgent ];

/// Admission/Readmission
Property PAADMAdmReadm As %String(DISPLAYLIST = ",Admission,Readmission", MAXLEN = 11, TRUNCATE = 1, VALUELIST = ",A,R") [ SqlColumnNumber = 149, SqlFieldName = PAADM_AdmReadm ];

/// Des Ref to PACRoomType
Property PAADMRoomTypeDR As PACRoomType [ SqlColumnNumber = 150, SqlFieldName = PAADM_RoomType_DR ];

/// Des Ref to DTCDietType(order subcat)
Property PAADMDietTypeDR As ARCItemCat [ SqlColumnNumber = 151, SqlFieldName = PAADM_DietType_DR ];

/// Des Ref to MRADM (Main)
Property PAADMMainMRADMDR As MRAdm [ SqlColumnNumber = 152, SqlFieldName = PAADM_MainMRADM_DR ];

/// Student Des Ref to MRADM
Property PAADMStudentMRADMDR As MRAdm [ SqlColumnNumber = 153, SqlFieldName = PAADM_StudentMRADM_DR ];

/// Confidential Message
Property PAADMConfidentMessage As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 157, SqlFieldName = PAADM_ConfidentMessage, SqlListType = SUBNODE ];

/// Des Ref to ApptMethod
Property PAADMApptMethodDR As RBCAppointMethod [ SqlColumnNumber = 159, SqlFieldName = PAADM_ApptMethod_DR ];

/// Order Time
Property PAADMOrderTime As %Time [ SqlColumnNumber = 160, SqlFieldName = PAADM_OrderTime ];

/// Referral Type
Property PAADMReferralType As PACReferralType [ SqlColumnNumber = 161, SqlFieldName = PAADM_ReferralType ];

/// Des Ref RB_Appoint
Property PAADMAppointDR As RBAppointment [ SqlColumnNumber = 162, SqlFieldName = PAADM_Appoint_DR ];

/// Des Ref to Room
Property PAADMCurrentRoomDR As PACRoom [ SqlColumnNumber = 163, SqlFieldName = PAADM_CurrentRoom_DR ];

/// Des Ref to Ward
Property PAADMCurrentWardDR As PACWard [ SqlColumnNumber = 164, SqlFieldName = PAADM_CurrentWard_DR ];

/// Des Ref to RefAdm
Property PAADMRefAdmDR As PAAdm [ SqlColumnNumber = 165, SqlFieldName = PAADM_RefAdm_DR ];

/// First Or Readmission flag
Property PAADMFirstOrReadmis As %String(DISPLAYLIST = ",First Admission,Re-Admission", MAXLEN = 15, TRUNCATE = 1, VALUELIST = ",F,R") [ SqlColumnNumber = 166, SqlFieldName = PAADM_FirstOrReadmis ];

/// Des Ref PAC Bed
Property PAADMCurrentBedDR As PACBed [ SqlColumnNumber = 167, SqlFieldName = PAADM_CurrentBed_DR ];

/// Des Ref CTLOC
Property PAADMTempLocDR As CTLoc [ SqlColumnNumber = 168, SqlFieldName = PAADM_TempLoc_DR ];

/// Des Ref MotherAdm_DR
Property PAADMMotherAdmDR As PAAdm [ SqlColumnNumber = 169, SqlFieldName = PAADM_MotherAdm_DR ];

/// Medical Discharge
Property PAADMMedicalDischarge As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 170, SqlFieldName = PAADM_MedicalDischarge ];

/// Convert Date
Property PAADMConvertDate As %Date [ SqlColumnNumber = 171, SqlFieldName = PAADM_ConvertDate ];

/// Convert Time
Property PAADMConvertTime As %Time [ SqlColumnNumber = 172, SqlFieldName = PAADM_ConvertTime ];

/// Des REf CTCP
Property PAADMMedDischDocDR As CTCareProv [ SqlColumnNumber = 173, SqlFieldName = PAADM_MedDischDoc_DR ];

/// Des Ref RefDocList
Property PAADMRefDocListDR As PACRefDoctor [ SqlColumnNumber = 174, SqlFieldName = PAADM_RefDocList_DR ];

/// Des Ref Marital Status
Property PAADMMaritalStatusDR As CTMarital [ SqlColumnNumber = 175, SqlFieldName = PAADM_MaritalStatus_DR ];

/// Des Ref HCA_DR
Property PAADMHCADR As CTHealthCareArea [ SqlColumnNumber = 176, SqlFieldName = PAADM_HCA_DR ];

/// Des Ref Region
Property PAADMRegionDR As CTRegion [ SqlColumnNumber = 177, SqlFieldName = PAADM_Region_DR ];

/// Des Ref Process
Property PAADMCurrentProcessDR As PAProcess [ SqlColumnNumber = 178, SqlFieldName = PAADM_CurrentProcess_DR ];

/// Des Ref Process
Property PAADMPreviousProcessDR As PAProcess [ SqlColumnNumber = 179, SqlFieldName = PAADM_PreviousProcess_DR ];

/// Des Ref EpisSubType
Property PAADMEpissubtypeDR As PACEpisodeSubType [ SqlColumnNumber = 180, SqlFieldName = PAADM_Epissubtype_DR ];

/// Des Ref AdmReason
Property PAADMAdmReasonDR As PACAdmReason [ SqlColumnNumber = 181, SqlFieldName = PAADM_AdmReason_DR ];

/// Des Ref CauseInj
Property PAADMCauseInjDR As PACCauseOfInjury [ SqlColumnNumber = 182, SqlFieldName = PAADM_CauseInj_DR ];

/// Emergency Status
Property PAADMEmergencyStatus As %String(DISPLAYLIST = ",Queue,Cubicle", MAXLEN = 7, TRUNCATE = 1, VALUELIST = ",Q,C") [ SqlColumnNumber = 183, SqlFieldName = PAADM_EmergencyStatus ];

/// Seen Date
Property PAADMSeenDate As %Date [ SqlColumnNumber = 184, SqlFieldName = PAADM_SeenDate ];

/// Seen Time
Property PAADMSeenTime As %Time [ SqlColumnNumber = 185, SqlFieldName = PAADM_SeenTime ];

/// Registration Fee Flag
Property PAADMRegistrationFee As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 186, SqlFieldName = PAADM_RegistrationFee ];

/// Reason For Not Collect Reg Fee
Property PAADMReasonNotRegFee As BLCReasonNotRegFee [ SqlColumnNumber = 187, SqlFieldName = PAADM_ReasonNotRegFee ];

/// Special Category
Property PAADMSpecialCategory As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 188, SqlFieldName = PAADM_SpecialCategory ];

/// Special Document
Property PAADMSpecialDocument As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 189, SqlFieldName = PAADM_SpecialDocument ];

/// Des Ref LabourAccident
Property PAADMLabourAccidentDR As PATrafficAccident [ SqlColumnNumber = 190, SqlFieldName = PAADM_LabourAccident_DR ];

/// Flagged Patient
Property PAADMFlaggedPatient As %String(DISPLAYLIST = ",Yes,No,Unknown", MAXLEN = 7, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 191, SqlFieldName = PAADM_FlaggedPatient ];

/// Des Ref WaitList
Property PAADMWaitListDR As PAWaitingList [ SqlColumnNumber = 192, SqlFieldName = PAADM_WaitList_DR ];

/// FamilyDoctor
Property PAADMFamilyDoctor As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 193, SqlFieldName = PAADM_FamilyDoctor ];

/// Read Only
Property PAADMReadOnly As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 194, SqlFieldName = PAADM_ReadOnly ];

/// Des Ref Person Responsible Payment
Property PAADMPersonResponsiblePayment As PAPerson [ SqlColumnNumber = 195, SqlFieldName = PAADM_PersonResponsiblePayment ];

/// Verified
Property PAADMVerified As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ InitialExpression = "N", SqlColumnNumber = 196, SqlFieldName = PAADM_Verified ];

/// Completed
Property PAADMCompleted As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 197, SqlFieldName = PAADM_Completed ];

/// Des Ref HCP
Property PAADMHCPDR As CTHealthCareProvider [ SqlColumnNumber = 198, SqlFieldName = PAADM_HCP_DR ];

/// Des Ref RefClinTo
Property PAADMRefClinToDR As CTRefClin [ SqlColumnNumber = 199, SqlFieldName = PAADM_RefClinTo_DR ];

/// Adm Reference
Property PAADMAdmRef As %String(COLLATION = "AlphaUp", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 200, SqlFieldName = PAADM_AdmRef ];

/// PAADM_SeriousDisease
Property PAADMSeriousDisease As MRCICDDx [ SqlColumnNumber = 201, SqlFieldName = PAADM_SeriousDisease ];

/// MedDischDate
Property PAADMMedDischDate As %Date [ SqlColumnNumber = 202, SqlFieldName = PAADM_MedDischDate ];

/// MedDischTime
Property PAADMMedDischTime As %Time [ SqlColumnNumber = 203, SqlFieldName = PAADM_MedDischTime ];

/// Triage Date
Property PAADMTriageDate As %Date [ SqlColumnNumber = 204, SqlFieldName = PAADM_TriageDate ];

/// Triage Time
Property PAADMTriageTime As %Time [ SqlColumnNumber = 205, SqlFieldName = PAADM_TriageTime ];

/// Likelihood to Admit
Property PAADMLikelihoodAdmit As %String(DISPLAYLIST = ",Yes,No,Unknown", MAXLEN = 7, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 206, SqlFieldName = PAADM_LikelihoodAdmit ];

/// Des Ref Human Intent
Property PAADMHumanIntentDR As PACHumanIntent [ SqlColumnNumber = 207, SqlFieldName = PAADM_HumanIntent_DR ];

/// Des Ref PlaceOfInj
Property PAADMPlaceOfInjDR As PACPlaceOfInjury [ SqlColumnNumber = 208, SqlFieldName = PAADM_PlaceOfInj_DR ];

/// Des Ref Activity When Injured
Property PAADMActivityInjuredDR As PACActivityWhenInjured [ SqlColumnNumber = 209, SqlFieldName = PAADM_ActivityInjured_DR ];

/// Des Ref Occupation
Property PAADMOccupationDR As CTOccupation [ SqlColumnNumber = 210, SqlFieldName = PAADM_Occupation_DR ];

/// Person Resp Payment
Property PAADMPersonRespPayment As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 211, SqlFieldName = PAADM_PersonRespPayment ];

/// Request MR
Property PAADMRequestMR As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 212, SqlFieldName = PAADM_RequestMR ];

/// Inpat Bed Request Date
Property PAADMInpatBedReqDate As %Date [ SqlColumnNumber = 213, SqlFieldName = PAADM_InpatBedReqDate ];

/// Inpat Bed Req Time
Property PAADMInpatBedReqTime As %Time [ SqlColumnNumber = 214, SqlFieldName = PAADM_InpatBedReqTime ];

/// C Class
Property PAADMCClass As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 215, SqlFieldName = PAADM_CClass ];

/// UpdateDate
Property PAADMUpdateDate As %Date [ SqlColumnNumber = 216, SqlFieldName = PAADM_UpdateDate ];

/// UpdateTime
Property PAADMUpdateTime As %Time [ SqlColumnNumber = 217, SqlFieldName = PAADM_UpdateTime ];

/// Des Ref UpdateUser
Property PAADMUpdateUserDR As SSUser [ SqlColumnNumber = 218, SqlFieldName = PAADM_UpdateUser_DR ];

/// Des Ref RefDocClinic
Property PAADMRefDocClinicDR As PACRefDoctorClinic [ SqlColumnNumber = 219, SqlFieldName = PAADM_RefDocClinic_DR ];

/// Des Ref Current Resource
Property PAADMCurrentResourceDR As RBResource [ SqlColumnNumber = 220, SqlFieldName = PAADM_CurrentResource_DR ];

/// Confirm Referral
Property PAADMConfirmReferral As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 221, SqlFieldName = PAADM_ConfirmReferral ];

/// Des Ref RefPeriod
Property PAADMRefPeriodDR As PACReferralPeriod [ SqlColumnNumber = 222, SqlFieldName = PAADM_RefPeriod_DR ];

/// Des Ref OSVisitStatus
Property PAADMOSVisitStatusDR As PACOSVisitorStatus [ SqlColumnNumber = 223, SqlFieldName = PAADM_OSVisitStatus_DR ];

/// Date of Decision to refer patient
Property PAADMDateRefDecision As %Date [ SqlColumnNumber = 224, SqlFieldName = PAADM_DateRefDecision ];

/// Des Ref MethodRef
Property PAADMMethodRefDR As PACRefReceiptMethod [ SqlColumnNumber = 225, SqlFieldName = PAADM_MethodRef_DR ];

/// Des Ref Referral Priority
Property PAADMReferralPriorityDR As PACReferralPriority [ SqlColumnNumber = 226, SqlFieldName = PAADM_ReferralPriority_DR ];

/// Des Ref TumourSiteGroup
Property PAADMTumourSiteGroupDR As PACTumourSiteGroup [ SqlColumnNumber = 227, SqlFieldName = PAADM_TumourSiteGroup_DR ];

/// Des Ref ReasonDelDisch
Property PAADMReasonDelDischDR As PACReasonDelayDischarge [ SqlColumnNumber = 228, SqlFieldName = PAADM_ReasonDelDisch_DR ];

/// Hosp Chaplain Visit Required
Property PAADMHospChaplainVisitReq As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 229, SqlFieldName = PAADM_HospChaplainVisitReq ];

/// Own Minister Indicator
Property PAADMOwnMinisterIndicator As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 230, SqlFieldName = PAADM_OwnMinisterIndicator ];

/// Guarantee Adm Date
Property PAADMGuaranteeAdmDate As %Date [ SqlColumnNumber = 231, SqlFieldName = PAADM_GuaranteeAdmDate ];

/// Des Ref AEArrivalMode
Property PAADMAEArrivalModeDR As PACAEArrivalMode [ SqlColumnNumber = 232, SqlFieldName = PAADM_AEArrivalMode_DR ];

/// Des Ref CTPCP
Property PAADMInternalRefDocDR As CTCareProv [ SqlColumnNumber = 233, SqlFieldName = PAADM_InternalRefDoc_DR ];

/// Homer ID
Property PAADMHomerID As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 234, SqlFieldName = PAADM_HomerID ];

/// Ref Dr Consent
Property PAADMRefDrConsent As %String(DISPLAYLIST = ",Yes,No,Maybe", MAXLEN = 5, TRUNCATE = 1, VALUELIST = ",Y,N,M") [ SqlColumnNumber = 235, SqlFieldName = PAADM_RefDrConsent ];

/// Des Ref AdmMethod
Property PAADMAdmMethodDR As PACAdmissionMethod [ SqlColumnNumber = 236, SqlFieldName = PAADM_AdmMethod_DR ];

/// Date HCP Request Sent
Property PAADMDateHCPRequestSent As %Date [ SqlColumnNumber = 237, SqlFieldName = PAADM_DateHCPRequestSent ];

/// DateHCPreceived
Property PAADMDateHCPreceived As %Date [ SqlColumnNumber = 238, SqlFieldName = PAADM_DateHCPreceived ];

/// Des Ref HCPPriority
Property PAADMHCPPriorityDR As PACHCPPriority [ SqlColumnNumber = 239, SqlFieldName = PAADM_HCPPriority_DR ];

/// Des Ref AppointTransport
Property PAADMAppointTransportDR As RBCAppointTransport [ SqlColumnNumber = 240, SqlFieldName = PAADM_AppointTransport_DR ];

/// Police Division
Property PAADMPoliceDivision As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 241, SqlFieldName = PAADM_PoliceDivision ];

/// Specific Location
Property PAADMSpecificLoc As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 242, SqlFieldName = PAADM_SpecificLoc ];

/// Chaplain Name
Property PAADMChaplainName As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 243, SqlFieldName = PAADM_ChaplainName ];

/// ChaplainChurchAddress
Property PAADMChaplainChurchAddress As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 244, SqlFieldName = PAADM_ChaplainChurchAddress, SqlListType = SUBNODE ];

/// Chaplain Phone
Property PAADMChaplainPhone As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 245, SqlFieldName = PAADM_ChaplainPhone ];

/// Date Of Entry
Property PAADMDateOfEntry As %Date [ SqlColumnNumber = 246, SqlFieldName = PAADM_DateOfEntry ];

/// Interviewed By
Property PAADMInterviewedBy As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 247, SqlFieldName = PAADM_InterviewedBy, SqlListType = SUBNODE ];

/// Date Of Interview
Property PAADMDateOfInterview As %Date [ SqlColumnNumber = 248, SqlFieldName = PAADM_DateOfInterview ];

/// Interview Rec
Property PAADMInterviewRec As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 249, SqlFieldName = PAADM_InterviewRec ];

/// Overseas Visitor
Property PAADMOverseasVisitor As %String(DISPLAYLIST = ",Yes,No,Unknown", MAXLEN = 7, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 250, SqlFieldName = PAADM_OverseasVisitor ];

/// Des Ref OSVCountryFrom
Property PAADMOSVCountryFromDR As CTCountry [ SqlColumnNumber = 251, SqlFieldName = PAADM_OSVCountryFrom_DR ];

/// Other Hospital
Property PAADMOtherHospital As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 252, SqlFieldName = PAADM_OtherHospital ];

/// Permanent Resident
Property PAADMPermanentResident As %String(DISPLAYLIST = ",Yes,No,Unknown", MAXLEN = 7, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 253, SqlFieldName = PAADM_PermanentResident ];

/// Date Received
Property PAADMDateReceived As %Date [ SqlColumnNumber = 254, SqlFieldName = PAADM_DateReceived ];

/// Des Ref SourceOfAttend
Property PAADMSourceOfAttendDR As PACSourceOfAttendance [ SqlColumnNumber = 255, SqlFieldName = PAADM_SourceOfAttend_DR ];

/// Des Ref MajorIncident
Property PAADMMajorIncidentDR As PAMajorIncident [ SqlColumnNumber = 256, SqlFieldName = PAADM_MajorIncident_DR ];

/// Report Date
Property PAADMReportDate As %Date [ SqlColumnNumber = 257, SqlFieldName = PAADM_ReportDate ];

/// Des Ref OESubCat
Property PAADMOESubCatDR As ARCItemCat [ SqlColumnNumber = 258, SqlFieldName = PAADM_OESubCat_DR ];

/// Des Ref RefStat
Property PAADMRefStatDR As PACReferralStatus [ SqlColumnNumber = 259, SqlFieldName = PAADM_RefStat_DR ];

/// Des Ref PostDischStatus
Property PAADMPostDischStatusDR As RTCPostDischargeStatus [ SqlColumnNumber = 260, SqlFieldName = PAADM_PostDischStatus_DR ];

/// Des Ref DNAReason
Property PAADMDNAReason As PACWLReasonNotAvail [ SqlColumnNumber = 261, SqlFieldName = PAADM_DNAReason ];

/// Nursing Notes Flag
Property PAADMNursingNotesFlag As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 262, SqlFieldName = PAADM_NursingNotesFlag ];

/// Des Ref CancelReason
Property PAADMCancelReasonDR As PACAdmCancelReason [ SqlColumnNumber = 263, SqlFieldName = PAADM_CancelReason_DR ];

/// Consent to Receive Fundrising Information
Property PAADMConsentRecFundInfo As %String(DISPLAYLIST = ",Yes,No,Maybe", MAXLEN = 5, TRUNCATE = 1, VALUELIST = ",Y,N,M") [ SqlColumnNumber = 264, SqlFieldName = PAADM_ConsentRecFundInfo ];

/// Consent to undertake Pat Satisf Survey
Property PAADMConsentPatSatisfSurve As %String(DISPLAYLIST = ",Yes,No,Maybe", MAXLEN = 5, TRUNCATE = 1, VALUELIST = ",Y,N,M") [ SqlColumnNumber = 265, SqlFieldName = PAADM_ConsentPatSatisfSurve ];

/// Frequent Admissions
Property PAADMFrequentAdmissions As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 266, SqlFieldName = PAADM_FrequentAdmissions ];

/// Discharge Comments
Property PAADMDischComments As %String(COLLATION = "Exact", MAXLEN = 300, TRUNCATE = 1) [ SqlColumnNumber = 267, SqlFieldName = PAADM_DischComments ];

/// PatientContacted
Property PAADMPatientContacted As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 268, SqlFieldName = PAADM_PatientContacted ];

/// Des Ref LikelyTransICU
Property PAADMLikelyTransICUDR As PACLikelyTransferoutICU [ SqlColumnNumber = 269, SqlFieldName = PAADM_LikelyTransICU_DR ];

/// Estimated Discharge Confirmed
Property PAADMEstDischConfirmed As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 270, SqlFieldName = PAADM_EstDischConfirmed ];

/// Des Ref PatClassif
Property PAADMPatClassifDR As PACPatientClassification [ SqlColumnNumber = 271, SqlFieldName = PAADM_PatClassif_DR ];

/// Des Ref ConvertUser
Property PAADMConvertUserDR As SSUser [ SqlColumnNumber = 272, SqlFieldName = PAADM_ConvertUser_DR ];

/// Des Ref InPatAdmType
Property PAADMInPatAdmTypeDR As PACInPatAdmissionType [ SqlColumnNumber = 273, SqlFieldName = PAADM_InPatAdmType_DR ];

/// Admission FIM
Property PAADMAdmissionFIM As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 274, SqlFieldName = PAADM_AdmissionFIM, SqlListType = SUBNODE ];

/// Discharge FIM
Property PAADMDischargeFIM As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 275, SqlFieldName = PAADM_DischargeFIM ];

/// Related
Property PAADMRelated As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 276, SqlFieldName = PAADM_Related ];

/// Des Ref TreatingDr
Property PAADMTreatingDrDR As CTCareProv [ SqlColumnNumber = 277, SqlFieldName = PAADM_TreatingDr_DR ];

/// Des Ref ContractSpoke
Property PAADMContractSpokeDR As PACContractSpokIdentifier [ SqlColumnNumber = 278, SqlFieldName = PAADM_ContractSpoke_DR ];

/// Des Ref ContractType
Property PAADMContractTypeDR As PACContractType [ SqlColumnNumber = 279, SqlFieldName = PAADM_ContractType_DR ];

/// Des Ref ContractRole
Property PAADMContractRoleDR As PACContractRole [ SqlColumnNumber = 280, SqlFieldName = PAADM_ContractRole_DR ];

/// Des Ref FundingArrangement
Property PAADMFundingArrangementDR As PACFundingArrangement [ SqlColumnNumber = 281, SqlFieldName = PAADM_FundingArrangement_DR ];

/// Des Ref BillingMethod
Property PAADMBillingMethodDR As PACBillingMethod [ SqlColumnNumber = 282, SqlFieldName = PAADM_BillingMethod_DR ];

/// Des Ref Palliative Care
Property PAADMPalliativeCareDR As PACPalliativeCareState [ SqlColumnNumber = 283, SqlFieldName = PAADM_PalliativeCare_DR ];

/// Des Ref BedMobility
Property PAADMBedMobilityDR As PACBedMobility [ SqlColumnNumber = 284, SqlFieldName = PAADM_BedMobility_DR ];

/// Des Ref Toileting
Property PAADMToiletingDR As PACToileting [ SqlColumnNumber = 285, SqlFieldName = PAADM_Toileting_DR ];

/// Des Ref Transfer
Property PAADMTransferDR As PACTransferring [ SqlColumnNumber = 286, SqlFieldName = PAADM_Transfer_DR ];

/// Des Ref Eating
Property PAADMEatingDR As PACEating [ SqlColumnNumber = 287, SqlFieldName = PAADM_Eating_DR ];

/// RUG Total
Property PAADMRUGTotal As %Float [ SqlColumnNumber = 288, SqlFieldName = PAADM_RUGTotal ];

/// Barthel Score
Property PAADMBarthelScore As %Float [ SqlColumnNumber = 289, SqlFieldName = PAADM_BarthelScore ];

/// Discharge Barthel Score
Property PAADMDischargeBarthelScore As %Float [ SqlColumnNumber = 290, SqlFieldName = PAADM_DischargeBarthelScore ];

/// Des Ref ClinicalSubProgram
Property PAADMClinicalSubProgramDR As PACClinicalSubProgram [ SqlColumnNumber = 291, SqlFieldName = PAADM_ClinicalSubProgram_DR ];

/// Des Ref ReadmToRehab
Property PAADMReadmToRehabDR As PACReAdmissionToRehab [ SqlColumnNumber = 292, SqlFieldName = PAADM_ReadmToRehab_DR ];

/// Onset Date
Property PAADMOnsetDate As %Date [ SqlColumnNumber = 293, SqlFieldName = PAADM_OnsetDate ];

/// Mini Mental Ass Score
Property PAADMMiniMentalAssScore As %Float [ SqlColumnNumber = 294, SqlFieldName = PAADM_MiniMentalAssScore ];

/// Des Ref CTPCP
Property PAADMTriageNurseDR As CTCareProv [ SqlColumnNumber = 295, SqlFieldName = PAADM_TriageNurse_DR ];

/// Des Ref StatePPP
Property PAADMStatePPPDR As PACStatePPP [ SqlColumnNumber = 296, SqlFieldName = PAADM_StatePPP_DR ];

/// Day Surgery Type
Property PAADMDaySurgeryType As %String(DISPLAYLIST = ",DayOfSurgery,DayOfSurgeryAdmission,NonDayOfSurgeryAdmission", MAXLEN = 24, TRUNCATE = 1, VALUELIST = ",D,A,N") [ SqlColumnNumber = 297, SqlFieldName = PAADM_DaySurgeryType ];

/// Transfer Facility
Property PAADMTransferFacility As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 298, SqlFieldName = PAADM_TransferFacility ];

/// Des Ref AppointBookingSystem
Property PAADMAppointBookingSystemDR As PACApptBookingSystem [ SqlColumnNumber = 299, SqlFieldName = PAADM_AppointBookingSystem_DR ];

/// Des Ref ParentWard
Property PAADMParentWardDR As PACWard [ SqlColumnNumber = 300, SqlFieldName = PAADM_ParentWard_DR ];

/// Des Ref PatAcuity
Property PAADMPatAcuityDR As PACPatAcuity [ SqlColumnNumber = 301, SqlFieldName = PAADM_PatAcuity_DR ];

/// Des Ref SecondaryReason
Property PAADMSecondaryReasonDR As PACAdmReason [ SqlColumnNumber = 302, SqlFieldName = PAADM_SecondaryReason_DR ];

/// Date Disch Hosp
Property PAADMDateDischHosp As %Date [ SqlColumnNumber = 303, SqlFieldName = PAADM_DateDischHosp ];

/// Des Ref CaseManager
Property PAADMCaseManagerDR As CTCareProv [ SqlColumnNumber = 304, SqlFieldName = PAADM_CaseManager_DR ];

/// Date First Appt
Property PAADMDateFirstAppt As %Date [ SqlColumnNumber = 305, SqlFieldName = PAADM_DateFirstAppt ];

/// Last Contact Family
Property PAADMLastContactFamily As %Date [ SqlColumnNumber = 306, SqlFieldName = PAADM_LastContactFamily ];

/// Rejection Reason
Property PAADMRejectionReason As %String(COLLATION = "Exact", MAXLEN = 250, TRUNCATE = 1) [ SqlColumnNumber = 307, SqlFieldName = PAADM_RejectionReason ];

/// Long Stay
Property PAADMLongStay As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 308, SqlFieldName = PAADM_LongStay ];

/// Des Ref InternalRefLoc
Property PAADMInternalRefLocDR As CTLoc [ SqlColumnNumber = 309, SqlFieldName = PAADM_InternalRefLoc_DR ];

/// Date Pat Reffered for Assess
Property PAADMDatePatRefferedAssess As %Date [ SqlColumnNumber = 310, SqlFieldName = PAADM_DatePatRefferedAssess ];

/// Date Social Worker Alloc
Property PAADMDateSocialWorkerAlloc As %Date [ SqlColumnNumber = 311, SqlFieldName = PAADM_DateSocialWorkerAlloc ];

/// Date Social Worker Completed
Property PAADMDateSocialWorkerCompleted As %Date [ SqlColumnNumber = 312, SqlFieldName = PAADM_DateSocialWorkerCompleted ];

/// Date Assessment Completed
Property PAADMDateAssessmentCompleted As %Date [ SqlColumnNumber = 313, SqlFieldName = PAADM_DateAssessmentCompleted ];

/// Social Worker Name
Property PAADMSocialWorkerName As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 314, SqlFieldName = PAADM_SocialWorkerName ];

/// Pat Destination
Property PAADMPatDestination As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 315, SqlFieldName = PAADM_PatDestination ];

/// Delay Reason
Property PAADMDelayReason As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 316, SqlFieldName = PAADM_DelayReason, SqlListType = SUBNODE ];

/// Has Commun Soc Worker
Property PAADMHasCommunSocWorker As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 317, SqlFieldName = PAADM_HasCommunSocWorker ];

/// Has Funding
Property PAADMHasFunding As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 318, SqlFieldName = PAADM_HasFunding ];

/// Autocode Required
Property PAADMAutocodeRequired As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 319, SqlFieldName = PAADM_AutocodeRequired ];

/// Des Ref SocialWorkerCentre
Property PAADMSocialWorkerCentreDR As CTSocWorkerCentre [ SqlColumnNumber = 320, SqlFieldName = PAADM_SocialWorkerCentre_DR ];

/// Des Ref LocalAuthority
Property PAADMLocalAuthorityDR As CTLocalAuthority [ SqlColumnNumber = 321, SqlFieldName = PAADM_LocalAuthority_DR ];

/// Des Ref NonGovOrg
Property PAADMNonGovOrgDR As PACNonGovOrg [ SqlColumnNumber = 322, SqlFieldName = PAADM_NonGovOrg_DR ];

/// TempLocDate
Property PAADMTempLocDate As %Date [ SqlColumnNumber = 323, SqlFieldName = PAADM_TempLocDate ];

/// TempLocTime
Property PAADMTempLocTime As %Time [ SqlColumnNumber = 324, SqlFieldName = PAADM_TempLocTime ];

/// Des Ref QualifStatus
Property PAADMQualifStatusDR As PACQualificationStatus [ SqlColumnNumber = 325, SqlFieldName = PAADM_QualifStatus_DR ];

/// Des Ref SuspectCancerType
Property PAADMSuspectCancerTypeDR As PACSuspectCancerType [ SqlColumnNumber = 326, SqlFieldName = PAADM_SuspectCancerType_DR ];

/// Des Ref Pregnancy
Property PAADMPregnancyDR As PAPregnancy [ SqlColumnNumber = 327, SqlFieldName = PAADM_Pregnancy_DR ];

/// Des Ref RefToNonGov
Property PAADMRefToNonGovDR As PACNonGovOrg [ SqlColumnNumber = 328, SqlFieldName = PAADM_RefToNonGov_DR ];

/// Ref To NGO Contact Name
Property PAADMRefToNGOContactName As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 329, SqlFieldName = PAADM_RefToNGOContactName ];

/// RefOrgAddress
Property PAADMRefOrgAddress As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 330, SqlFieldName = PAADM_RefOrgAddress, SqlListType = SUBNODE ];

/// DischgHospital
Property PAADMDischgHospital As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 331, SqlFieldName = PAADM_DischgHospital ];

/// Des Ref Hospital
Property PAADMHospitalDR As CTHospital [ SqlColumnNumber = 332, SqlFieldName = PAADM_Hospital_DR ];

/// Only Viewable by Episode CareProv
Property PAADMViewablebyEpCareProv As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 333, SqlFieldName = PAADM_ViewablebyEpCareProv ];

/// Des Ref MaternityVisType
Property PAADMMaternityVisTypeDR As PACMaternityVisitType [ SqlColumnNumber = 334, SqlFieldName = PAADM_MaternityVisType_DR ];

/// Lab Clinical Condition
Property PAADMLabClinicalCondition As %String(COLLATION = "Exact", MAXLEN = 255, TRUNCATE = 1) [ SqlColumnNumber = 335, SqlFieldName = PAADM_LabClinicalCondition ];

/// Telephone Active
Property PAADMTelephoneActive As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 336, SqlFieldName = PAADM_TelephoneActive ];

/// CodingUpdateDate
Property PAADMCodingUpdateDate As %Date [ SqlColumnNumber = 337, SqlFieldName = PAADM_CodingUpdateDate ];

/// CodingUpdateTime
Property PAADMCodingUpdateTime As %Time [ SqlColumnNumber = 338, SqlFieldName = PAADM_CodingUpdateTime ];

/// Des Ref CodingUpdateUser
Property PAADMCodingUpdateUserDR As SSUser [ SqlColumnNumber = 339, SqlFieldName = PAADM_CodingUpdateUser_DR ];

/// Create Preadmission
Property PAADMCreatePreadmission As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 340, SqlFieldName = PAADM_CreatePreadmission ];

/// Book Loc Ready
Property PAADMBookLocReady As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 341, SqlFieldName = PAADM_BookLocReady ];

/// DaysCarriedForward
Property PAADMDaysCarriedForward As %Float [ SqlColumnNumber = 342, SqlFieldName = PAADM_DaysCarriedForward ];

/// Des Ref RBCCancelReason
Property PAADMRBCCancelReasonDR As RBCReasonForCancel [ SqlColumnNumber = 343, SqlFieldName = PAADM_RBCCancelReason_DR ];

/// Des Ref Hospital
Property PAADMUpdateUserHospitalDR As CTHospital [ SqlColumnNumber = 344, SqlFieldName = PAADM_UpdateUserHospital_DR ];

/// Consent DVA
Property PAADMConsentDVA As %String(DISPLAYLIST = ",Yes,No,Unable", MAXLEN = 6, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 346, SqlFieldName = PAADM_ConsentDVA ];

/// Consent Work Compens
Property PAADMConsentWorkCompens As %String(DISPLAYLIST = ",Yes,No,Unable", MAXLEN = 6, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 347, SqlFieldName = PAADM_ConsentWorkCompens ];

/// Consent Motor Vehicle
Property PAADMConsentMotorVehicle As %String(DISPLAYLIST = ",Yes,No,Unable", MAXLEN = 6, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 348, SqlFieldName = PAADM_ConsentMotorVehicle ];

/// Consent Dep Of Defence
Property PAADMConsentDepOfDefence As %String(DISPLAYLIST = ",Yes,No,Unable", MAXLEN = 6, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 349, SqlFieldName = PAADM_ConsentDepOfDefence ];

/// Consent Feedback
Property PAADMConsentFeedback As %String(DISPLAYLIST = ",Yes,No,Unable", MAXLEN = 6, TRUNCATE = 1, VALUELIST = ",Y,N,U") [ SqlColumnNumber = 350, SqlFieldName = PAADM_ConsentFeedback ];

/// PrevInPatAdmPalliativeCare
Property PAADMPrevInPatAdmPalliativeCare As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 351, SqlFieldName = PAADM_PrevInPatAdmPalliativeCare ];

/// PrevNonInPatPalliativeCare
Property PAADMPrevNonInPatPalliativeCare As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 352, SqlFieldName = PAADM_PrevNonInPatPalliativeCare ];

/// Doctor Letter Notes
Property PAADMDoctorLetterNotes As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 353, SqlFieldName = PAADM_DoctorLetterNotes, SqlListType = SUBNODE ];

/// PatientLetterNotes
Property PAADMPatientLetterNotes As list Of %String(COLLATION = "Exact", MAXLEN = "", TRUNCATE = 1) [ SqlColumnNumber = 354, SqlFieldName = PAADM_PatientLetterNotes, SqlListType = SUBNODE ];

/// Audit Letter Response
Property PAADMAuditLetterResponse As %String(DISPLAYLIST = ",Yes,No", MAXLEN = 3, TRUNCATE = 1, VALUELIST = ",Y,N") [ SqlColumnNumber = 355, SqlFieldName = PAADM_AuditLetterResponse ];

/// Des Ref UsualAccom
Property PAADMUsualAccomDR As PACUsualAccomodation [ SqlColumnNumber = 356, SqlFieldName = PAADM_UsualAccom_DR ];

/// FinDischDate
Property PAADMFinDischDate As %Date [ SqlColumnNumber = 357, SqlFieldName = PAADM_FinDischDate ];

/// Fin Disch Time
Property PAADMFinDischTime As %Time [ SqlColumnNumber = 358, SqlFieldName = PAADM_FinDischTime ];

/// InjuryIncidentDate
Property PAADMInjuryIncidentDate As %Date [ SqlColumnNumber = 359, SqlFieldName = PAADM_InjuryIncidentDate ];

/// Des Ref PAAdm2
Property PAADMPAAdm2DR As PAAdm2 [ SqlColumnNumber = 360, SqlComputeCode = { s {PAADM_PAAdm2_DR}={PAADM_RowID}
}, SqlComputed, SqlFieldName = PAADM_PAAdm2_DR, Transient ];

Trigger TAfterIns [ Event = INSERT, Order = 1, Time = AFTER ]
{
 d ##Class(User.PAAdm).OnTrigger($g(%d(1)))
 d ##Class(websys.DSSActionType).doSomething($g(%d(1)),"L","User.PAAdm","OnAfterInsert")
 d updbill^at83d($g(%d(1)))
 d Table^HL7Outbound("PAAdm",%d(1),"Insert")
}

Trigger TAfterUpd [ Event = UPDATE, Order = 2, Time = AFTER ]
{
 d ##Class(User.PAAdm).OnTrigger($g(%d(1)))
 d updbill^at83d($g(%d(1)))
 d ##Class(websys.DSSActionType).doSomething($g(%d(1)),"L","User.PAAdm","OnAfterUpdate")
 d Table^HL7Outbound("PAAdm",%d(1),"Update")
 d ##Class(web.PAAdm).TAfterUpd()
}

Trigger TBeforeDel [ Event = DELETE, Order = 3 ]
{
 d ##Class(User.PAAdm).getOld($g(%d(1)))
 d ##Class(websys.DSSActionType).doSomething($g(%d(1)),"L","User.PAAdm","OnBeforeDelete")
}

Trigger TBeforeUpd [ Event = UPDATE, Order = 2 ]
{
 d ##Class(User.PAAdm).getOld($g(%d(1)))
 d ##Class(websys.DSSActionType).doSomething($g(%d(1)),"L","User.PAAdm","OnBeforeUpdate")
}

Trigger TBeforeIns [ Event = INSERT, Order = 1 ]
{
 d ##Class(websys.DSSActionType).doSomething($g(%d(1)),"L","User.PAAdm","OnBeforeInsert")
}

Trigger TAfterDel [ Event = DELETE, Order = 3, Time = AFTER ]
{
 d ##Class(User.PAAdm).OnTrigger($g(%d(1)))
 d ##Class(websys.DSSActionType).doSomething($g(%d(1)),"L","User.PAAdm","OnAfterDelete")
 d Table^HL7Outbound("PAAdm",%old(1),"Delete")
}

Parameter EXTENTSIZE = 1000000;

Storage SQLStorage
{
<ExtentSize>1000000</ExtentSize>
<SqlIdExpression>$i(^PAADM(0))</SqlIdExpression>
<SQLMap name="DataMasterMap">
<Data name="PAADM_ADMNo">
<Delimiter>"^"</Delimiter>
<Piece>81</Piece>
</Data>
<Data name="PAADM_AEArrivalMode_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>58</Piece>
</Data>
<Data name="PAADM_ActivityInjured_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>35</Piece>
</Data>
<Data name="PAADM_AdmCateg_DR">
<Delimiter>"^"</Delimiter>
<Piece>5</Piece>
</Data>
<Data name="PAADM_AdmDate">
<Delimiter>"^"</Delimiter>
<Piece>6</Piece>
</Data>
<Data name="PAADM_AdmDocCodeDR">
<Delimiter>"^"</Delimiter>
<Piece>9</Piece>
</Data>
<Data name="PAADM_AdmMethod_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>62</Piece>
</Data>
<Data name="PAADM_AdmReadm">
<Delimiter>"^"</Delimiter>
<Piece>56</Piece>
</Data>
<Data name="PAADM_AdmReason_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>7</Piece>
</Data>
<Data name="PAADM_AdmRef">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>26</Piece>
</Data>
<Data name="PAADM_AdmSrc_DR">
<Delimiter>"^"</Delimiter>
<Piece>10</Piece>
</Data>
<Data name="PAADM_AdmTime">
<Delimiter>"^"</Delimiter>
<Piece>7</Piece>
</Data>
<Data name="PAADM_AdmissionFIM">
<Node>"ADMFIM"</Node>
</Data>
<Data name="PAADM_AppointBookingSystem_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>54</Piece>
</Data>
<Data name="PAADM_AppointTransport_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>66</Piece>
</Data>
<Data name="PAADM_Appoint_DR">
<Delimiter>"^"</Delimiter>
<Piece>68</Piece>
</Data>
<Data name="PAADM_ApptMethod_DR">
<Delimiter>"^"</Delimiter>
<Piece>64</Piece>
</Data>
<Data name="PAADM_AuditLetterResponse">
<Delimiter>"^"</Delimiter>
<Node>3</Node>
<Piece>1</Piece>
</Data>
<Data name="PAADM_AutocodeRequired">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>73</Piece>
</Data>
<Data name="PAADM_BarthelScore">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>44</Piece>
</Data>
<Data name="PAADM_BedMobility_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>39</Piece>
</Data>
<Data name="PAADM_BillFlag">
<Delimiter>"^"</Delimiter>
<Piece>45</Piece>
</Data>
<Data name="PAADM_BillingMethod_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>37</Piece>
</Data>
<Data name="PAADM_BookLocReady">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>94</Piece>
</Data>
<Data name="PAADM_CClass">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>41</Piece>
</Data>
<Data name="PAADM_CancelReason_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>18</Piece>
</Data>
<Data name="PAADM_CaseManager_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>59</Piece>
</Data>
<Data name="PAADM_CauseInj_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>8</Piece>
</Data>
<Data name="PAADM_ChaplainChurchAddress">
<Node>"CHADR"</Node>
</Data>
<Data name="PAADM_ChaplainName">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>69</Piece>
</Data>
<Data name="PAADM_ChaplainPhone">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>70</Piece>
</Data>
<Data name="PAADM_ClinicalSubProgram_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>46</Piece>
</Data>
<Data name="PAADM_CodingUpdateDate">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>90</Piece>
</Data>
<Data name="PAADM_CodingUpdateTime">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>91</Piece>
</Data>
<Data name="PAADM_CodingUpdateUser_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>92</Piece>
</Data>
<Data name="PAADM_Completed">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>23</Piece>
</Data>
<Data name="PAADM_ConfidentMessage">
<Node>"CONF"</Node>
</Data>
<Data name="PAADM_Confidential">
<Delimiter>"^"</Delimiter>
<Piece>26</Piece>
</Data>
<Data name="PAADM_ConfirmReferral">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>47</Piece>
</Data>
<Data name="PAADM_ConsentDVA">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>99</Piece>
</Data>
<Data name="PAADM_ConsentDepOfDefence">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>102</Piece>
</Data>
<Data name="PAADM_ConsentFeedback">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>103</Piece>
</Data>
<Data name="PAADM_ConsentMotorVehicle">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>101</Piece>
</Data>
<Data name="PAADM_ConsentPatSatisfSurve">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>20</Piece>
</Data>
<Data name="PAADM_ConsentRecFundInfo">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>19</Piece>
</Data>
<Data name="PAADM_ConsentWorkCompens">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>100</Piece>
</Data>
<Data name="PAADM_ContractRole_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>35</Piece>
</Data>
<Data name="PAADM_ContractSpoke_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>33</Piece>
</Data>
<Data name="PAADM_ContractType_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>34</Piece>
</Data>
<Data name="PAADM_ConvertDate">
<Delimiter>"^"</Delimiter>
<Piece>77</Piece>
</Data>
<Data name="PAADM_ConvertTime">
<Delimiter>"^"</Delimiter>
<Piece>78</Piece>
</Data>
<Data name="PAADM_ConvertUser_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>27</Piece>
</Data>
<Data name="PAADM_ConvertedFromOut">
<Delimiter>"^"</Delimiter>
<Piece>80</Piece>
</Data>
<Data name="PAADM_CreateDate">
<Delimiter>"^"</Delimiter>
<Piece>41</Piece>
</Data>
<Data name="PAADM_CreatePreadmission">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>93</Piece>
</Data>
<Data name="PAADM_CreateTime">
<Delimiter>"^"</Delimiter>
<Piece>42</Piece>
</Data>
<Data name="PAADM_CreateUser">
<Delimiter>"^"</Delimiter>
<Piece>43</Piece>
</Data>
<Data name="PAADM_CurrentBed_DR">
<Delimiter>"^"</Delimiter>
<Piece>73</Piece>
</Data>
<Data name="PAADM_CurrentProcess_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>4</Piece>
</Data>
<Data name="PAADM_CurrentResource_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>46</Piece>
</Data>
<Data name="PAADM_CurrentRoom_DR">
<Delimiter>"^"</Delimiter>
<Piece>69</Piece>
</Data>
<Data name="PAADM_CurrentWard_DR">
<Delimiter>"^"</Delimiter>
<Piece>70</Piece>
</Data>
<Data name="PAADM_DNAReason">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>16</Piece>
</Data>
<Data name="PAADM_DateAssessmentCompleted">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>68</Piece>
</Data>
<Data name="PAADM_DateDischHosp">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>58</Piece>
</Data>
<Data name="PAADM_DateFirstAppt">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>60</Piece>
</Data>
<Data name="PAADM_DateHCPRequestSent">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>63</Piece>
</Data>
<Data name="PAADM_DateHCPreceived">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>64</Piece>
</Data>
<Data name="PAADM_DateOfEntry">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>1</Piece>
</Data>
<Data name="PAADM_DateOfInterview">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>3</Piece>
</Data>
<Data name="PAADM_DatePatRefferedAssess">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>65</Piece>
</Data>
<Data name="PAADM_DateReceived">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>9</Piece>
</Data>
<Data name="PAADM_DateRefDecision">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>50</Piece>
</Data>
<Data name="PAADM_DateSocialWorkerAlloc">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>66</Piece>
</Data>
<Data name="PAADM_DateSocialWorkerCompleted">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>67</Piece>
</Data>
<Data name="PAADM_DaySurgeryType">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>52</Piece>
</Data>
<Data name="PAADM_DaysCarriedForward">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>95</Piece>
</Data>
<Data name="PAADM_DelayReason">
<Node>"DEL"</Node>
</Data>
<Data name="PAADM_DepCode_DR">
<Delimiter>"^"</Delimiter>
<Piece>4</Piece>
</Data>
<Data name="PAADM_DietType_DR">
<Delimiter>"^"</Delimiter>
<Piece>58</Piece>
</Data>
<Data name="PAADM_DischComments">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>22</Piece>
</Data>
<Data name="PAADM_DischCond_DR">
<Delimiter>"^"</Delimiter>
<Piece>49</Piece>
</Data>
<Data name="PAADM_DischargeAppoint_DR">
<Delimiter>"^"</Delimiter>
<Piece>21</Piece>
</Data>
<Data name="PAADM_DischargeBarthelScore">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>45</Piece>
</Data>
<Data name="PAADM_DischargeFIM">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>30</Piece>
</Data>
<Data name="PAADM_DischgDate">
<Delimiter>"^"</Delimiter>
<Piece>17</Piece>
</Data>
<Data name="PAADM_DischgDoc_DR">
<Delimiter>"^"</Delimiter>
<Piece>19</Piece>
</Data>
<Data name="PAADM_DischgHospital">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>84</Piece>
</Data>
<Data name="PAADM_DischgTime">
<Delimiter>"^"</Delimiter>
<Piece>18</Piece>
</Data>
<Data name="PAADM_Dispos_DR">
<Delimiter>"^"</Delimiter>
<Piece>23</Piece>
</Data>
<Data name="PAADM_DoctorLetterNotes">
<Node>"DLN"</Node>
</Data>
<Data name="PAADM_Eating_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>42</Piece>
</Data>
<Data name="PAADM_EmergencyDate">
<Delimiter>"^"</Delimiter>
<Piece>37</Piece>
</Data>
<Data name="PAADM_EmergencyNo">
<Delimiter>"^"</Delimiter>
<Piece>31</Piece>
</Data>
<Data name="PAADM_EmergencyStatus">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>9</Piece>
</Data>
<Data name="PAADM_EmergencyTime">
<Delimiter>"^"</Delimiter>
<Piece>38</Piece>
</Data>
<Data name="PAADM_Epissubtype_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>6</Piece>
</Data>
<Data name="PAADM_EstDischConfirmed">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>25</Piece>
</Data>
<Data name="PAADM_EstimDischargeDate">
<Delimiter>"^"</Delimiter>
<Piece>59</Piece>
</Data>
<Data name="PAADM_EstimDischargeTime">
<Delimiter>"^"</Delimiter>
<Piece>60</Piece>
</Data>
<Data name="PAADM_EstimOperDate">
<Delimiter>"^"</Delimiter>
<Piece>53</Piece>
</Data>
<Data name="PAADM_ExpAdmDate">
<Delimiter>"^"</Delimiter>
<Piece>12</Piece>
</Data>
<Data name="PAADM_ExpLOS">
<Delimiter>"^"</Delimiter>
<Piece>27</Piece>
</Data>
<Data name="PAADM_FamilyDoctor">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>19</Piece>
</Data>
<Data name="PAADM_FinDischDate">
<Delimiter>"^"</Delimiter>
<Node>3</Node>
<Piece>3</Piece>
</Data>
<Data name="PAADM_FinDischTime">
<Delimiter>"^"</Delimiter>
<Node>3</Node>
<Piece>4</Piece>
</Data>
<Data name="PAADM_FirstOrReadmis">
<Delimiter>"^"</Delimiter>
<Piece>72</Piece>
</Data>
<Data name="PAADM_FlaggedPatient">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>17</Piece>
</Data>
<Data name="PAADM_FrequentAdmissions">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>21</Piece>
</Data>
<Data name="PAADM_FundingArrangement_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>36</Piece>
</Data>
<Data name="PAADM_GuaranteeAdmDate">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>57</Piece>
</Data>
<Data name="PAADM_HCA_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>2</Piece>
</Data>
<Data name="PAADM_HCPPriority_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>65</Piece>
</Data>
<Data name="PAADM_HCP_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>24</Piece>
</Data>
<Data name="PAADM_HCR_DR">
<Delimiter>"^"</Delimiter>
<Piece>24</Piece>
</Data>
<Data name="PAADM_HasCommunSocWorker">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>71</Piece>
</Data>
<Data name="PAADM_HasFunding">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>72</Piece>
</Data>
<Data name="PAADM_HomerID">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>60</Piece>
</Data>
<Data name="PAADM_HospChaplainVisitReq">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>56</Piece>
</Data>
<Data name="PAADM_Hospital_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>85</Piece>
</Data>
<Data name="PAADM_HumanIntent_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>33</Piece>
</Data>
<Data name="PAADM_InPatAdmType_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>28</Piece>
</Data>
<Data name="PAADM_InPatNo">
<Delimiter>"^"</Delimiter>
<Piece>29</Piece>
</Data>
<Data name="PAADM_Infect_DR">
<Delimiter>"^"</Delimiter>
<Piece>51</Piece>
</Data>
<Data name="PAADM_InjuryIncidentDate">
<Delimiter>"^"</Delimiter>
<Node>3</Node>
<Piece>5</Piece>
</Data>
<Data name="PAADM_InpatBedReqDate">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>39</Piece>
</Data>
<Data name="PAADM_InpatBedReqTime">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>40</Piece>
</Data>
<Data name="PAADM_InternalRefDoc_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>59</Piece>
</Data>
<Data name="PAADM_InternalRefLoc_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>64</Piece>
</Data>
<Data name="PAADM_InterviewRec">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>4</Piece>
</Data>
<Data name="PAADM_InterviewedBy">
<Node>"INTERV"</Node>
</Data>
<Data name="PAADM_Isolate">
<Delimiter>"^"</Delimiter>
<Piece>36</Piece>
</Data>
<Data name="PAADM_LabClinicalCondition">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>88</Piece>
</Data>
<Data name="PAADM_LabourAccident_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>16</Piece>
</Data>
<Data name="PAADM_LastContactFamily">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>61</Piece>
</Data>
<Data name="PAADM_LikelihoodAdmit">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>32</Piece>
</Data>
<Data name="PAADM_LikelyTransICU_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>24</Piece>
</Data>
<Data name="PAADM_LocalAuthority_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>75</Piece>
</Data>
<Data name="PAADM_LongStay">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>63</Piece>
</Data>
<Data name="PAADM_MainMRADM_DR">
<Delimiter>"^"</Delimiter>
<Piece>61</Piece>
</Data>
<Data name="PAADM_MajorIncident_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>11</Piece>
</Data>
<Data name="PAADM_MaritalStatus_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>1</Piece>
</Data>
<Data name="PAADM_MaternityVisType_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>87</Piece>
</Data>
<Data name="PAADM_MealPreference">
<Delimiter>"^"</Delimiter>
<Piece>40</Piece>
</Data>
<Data name="PAADM_MedDischDate">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>28</Piece>
</Data>
<Data name="PAADM_MedDischDoc_DR">
<Delimiter>"^"</Delimiter>
<Piece>79</Piece>
</Data>
<Data name="PAADM_MedDischTime">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>29</Piece>
</Data>
<Data name="PAADM_MedicalDischarge">
<Delimiter>"^"</Delimiter>
<Piece>63</Piece>
</Data>
<Data name="PAADM_MethodRef_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>51</Piece>
</Data>
<Data name="PAADM_MiniMentalAssScore">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>49</Piece>
</Data>
<Data name="PAADM_MotherAdm_DR">
<Delimiter>"^"</Delimiter>
<Piece>75</Piece>
</Data>
<Data name="PAADM_NonGovOrg_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>76</Piece>
</Data>
<Data name="PAADM_NursingNotesFlag">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>17</Piece>
</Data>
<Data name="PAADM_OESubCat_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>13</Piece>
</Data>
<Data name="PAADM_OSVCountryFrom_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>6</Piece>
</Data>
<Data name="PAADM_OSVisitStatus_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>49</Piece>
</Data>
<Data name="PAADM_Occupation_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>36</Piece>
</Data>
<Data name="PAADM_OnsetDate">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>48</Piece>
</Data>
<Data name="PAADM_Oper_DR">
<Delimiter>"^"</Delimiter>
<Piece>54</Piece>
</Data>
<Data name="PAADM_OrderTime">
<Delimiter>"^"</Delimiter>
<Piece>66</Piece>
</Data>
<Data name="PAADM_OriginalAdmissionDR">
<Delimiter>"^"</Delimiter>
<Piece>39</Piece>
</Data>
<Data name="PAADM_OtherDischType">
<Delimiter>"^"</Delimiter>
<Piece>50</Piece>
</Data>
<Data name="PAADM_OtherHospital">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>7</Piece>
</Data>
<Data name="PAADM_OtherInfectType">
<Delimiter>"^"</Delimiter>
<Piece>52</Piece>
</Data>
<Data name="PAADM_OverseasVisitor">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>5</Piece>
</Data>
<Data name="PAADM_OwnMinisterIndicator">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>55</Piece>
</Data>
<Data name="PAADM_PAPMI_DR">
<Delimiter>"^"</Delimiter>
<Piece>1</Piece>
</Data>
<Data name="PAADM_PaidEmergencySurcharge">
<Delimiter>"^"</Delimiter>
<Piece>76</Piece>
</Data>
<Data name="PAADM_PalliativeCare_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>38</Piece>
</Data>
<Data name="PAADM_ParentWard_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>55</Piece>
</Data>
<Data name="PAADM_PatAcuity_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>56</Piece>
</Data>
<Data name="PAADM_PatClassif_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>26</Piece>
</Data>
<Data name="PAADM_PatDestination">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>70</Piece>
</Data>
<Data name="PAADM_PatType_DR">
<Delimiter>"^"</Delimiter>
<Piece>3</Piece>
</Data>
<Data name="PAADM_PatientContacted">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>23</Piece>
</Data>
<Data name="PAADM_PatientLetterNotes">
<Node>"PLN"</Node>
</Data>
<Data name="PAADM_PermanentResident">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>8</Piece>
</Data>
<Data name="PAADM_PersonRespPayment">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>37</Piece>
</Data>
<Data name="PAADM_PersonResponsiblePayment">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>21</Piece>
</Data>
<Data name="PAADM_PlaceOfInj_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>34</Piece>
</Data>
<Data name="PAADM_PoliceDivision">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>67</Piece>
</Data>
<Data name="PAADM_PostDischStatus_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>15</Piece>
</Data>
<Data name="PAADM_PreAdmNo">
<Delimiter>"^"</Delimiter>
<Piece>32</Piece>
</Data>
<Data name="PAADM_PreAdmitDate">
<Delimiter>"^"</Delimiter>
<Piece>34</Piece>
</Data>
<Data name="PAADM_PreAdmitTime">
<Delimiter>"^"</Delimiter>
<Piece>35</Piece>
</Data>
<Data name="PAADM_PreAdmitted">
<Delimiter>"^"</Delimiter>
<Piece>13</Piece>
</Data>
<Data name="PAADM_Pregnancy_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>81</Piece>
</Data>
<Data name="PAADM_PrevInPatAdmPalliativeCare">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>104</Piece>
</Data>
<Data name="PAADM_PrevNonInPatPalliativeCare">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>105</Piece>
</Data>
<Data name="PAADM_PreviousProcess_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>5</Piece>
</Data>
<Data name="PAADM_Priority_DR">
<Delimiter>"^"</Delimiter>
<Piece>33</Piece>
</Data>
<Data name="PAADM_QualifStatus_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>79</Piece>
</Data>
<Data name="PAADM_RBCCancelReason_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>96</Piece>
</Data>
<Data name="PAADM_RUGTotal">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>43</Piece>
</Data>
<Data name="PAADM_ReadOnly">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>20</Piece>
</Data>
<Data name="PAADM_ReadmToRehab_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>47</Piece>
</Data>
<Data name="PAADM_ReasonDelDisch_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>54</Piece>
</Data>
<Data name="PAADM_ReasonNotRegFee">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>13</Piece>
</Data>
<Data name="PAADM_RefAdm_DR">
<Delimiter>"^"</Delimiter>
<Piece>71</Piece>
</Data>
<Data name="PAADM_RefApprovNo">
<Delimiter>"^"</Delimiter>
<Piece>48</Piece>
</Data>
<Data name="PAADM_RefClinTo_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>25</Piece>
</Data>
<Data name="PAADM_RefClinic_DR">
<Delimiter>"^"</Delimiter>
<Piece>16</Piece>
</Data>
<Data name="PAADM_RefDate">
<Delimiter>"^"</Delimiter>
<Piece>46</Piece>
</Data>
<Data name="PAADM_RefDocClinic_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>45</Piece>
</Data>
<Data name="PAADM_RefDocCodeDR">
<Delimiter>"^"</Delimiter>
<Piece>15</Piece>
</Data>
<Data name="PAADM_RefDocList_DR">
<Delimiter>"^"</Delimiter>
<Piece>82</Piece>
</Data>
<Data name="PAADM_RefDrConsent">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>61</Piece>
</Data>
<Data name="PAADM_RefExpiryDate">
<Delimiter>"^"</Delimiter>
<Piece>47</Piece>
</Data>
<Data name="PAADM_RefOrgAddress">
<Node>"RAD"</Node>
</Data>
<Data name="PAADM_RefPeriod_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>48</Piece>
</Data>
<Data name="PAADM_RefStat_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>14</Piece>
</Data>
<Data name="PAADM_RefToNGOContactName">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>83</Piece>
</Data>
<Data name="PAADM_RefToNonGov_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>82</Piece>
</Data>
<Data name="PAADM_ReferralPriority_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>52</Piece>
</Data>
<Data name="PAADM_ReferralType">
<Delimiter>"^"</Delimiter>
<Piece>67</Piece>
</Data>
<Data name="PAADM_Region_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>3</Piece>
</Data>
<Data name="PAADM_RegistrationFee">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>12</Piece>
</Data>
<Data name="PAADM_RejectionReason">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>62</Piece>
</Data>
<Data name="PAADM_Related">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>31</Piece>
</Data>
<Data name="PAADM_Remark">
<Node>"CMT"</Node>
</Data>
<Data name="PAADM_ReportDate">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>12</Piece>
</Data>
<Data name="PAADM_RequestMR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>38</Piece>
</Data>
<Data name="PAADM_RoomType_DR">
<Delimiter>"^"</Delimiter>
<Piece>57</Piece>
</Data>
<Data name="PAADM_SecondaryReason_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>57</Piece>
</Data>
<Data name="PAADM_SeenDate">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>10</Piece>
</Data>
<Data name="PAADM_SeenTime">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>11</Piece>
</Data>
<Data name="PAADM_SeriousDisease">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>27</Piece>
</Data>
<Data name="PAADM_ShowInFutureEpisode">
<Delimiter>"^"</Delimiter>
<Piece>28</Piece>
</Data>
<Data name="PAADM_SocialWorkerCentre_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>74</Piece>
</Data>
<Data name="PAADM_SocialWorkerName">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>69</Piece>
</Data>
<Data name="PAADM_SourceOfAttend_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>10</Piece>
</Data>
<Data name="PAADM_SourceRef_DR">
<Delimiter>"^"</Delimiter>
<Piece>11</Piece>
</Data>
<Data name="PAADM_SpecialCategory">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>14</Piece>
</Data>
<Data name="PAADM_SpecialDocument">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>15</Piece>
</Data>
<Data name="PAADM_Specialty_DR">
<Delimiter>"^"</Delimiter>
<Piece>8</Piece>
</Data>
<Data name="PAADM_SpecificLoc">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>68</Piece>
</Data>
<Data name="PAADM_StatePPP_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>51</Piece>
</Data>
<Data name="PAADM_StudentMRADM_DR">
<Delimiter>"^"</Delimiter>
<Piece>62</Piece>
</Data>
<Data name="PAADM_SuspectCancerType_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>80</Piece>
</Data>
<Data name="PAADM_TelephoneActive">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>89</Piece>
</Data>
<Data name="PAADM_TempLocDate">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>77</Piece>
</Data>
<Data name="PAADM_TempLocTime">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>78</Piece>
</Data>
<Data name="PAADM_TempLoc_DR">
<Delimiter>"^"</Delimiter>
<Piece>74</Piece>
</Data>
<Data name="PAADM_Toileting_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>40</Piece>
</Data>
<Data name="PAADM_TrafficAccident_DR">
<Delimiter>"^"</Delimiter>
<Piece>25</Piece>
</Data>
<Data name="PAADM_TransferFacility">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>53</Piece>
</Data>
<Data name="PAADM_Transfer_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>41</Piece>
</Data>
<Data name="PAADM_TreatingDr_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>32</Piece>
</Data>
<Data name="PAADM_TriageDate">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>30</Piece>
</Data>
<Data name="PAADM_TriageNurse_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>50</Piece>
</Data>
<Data name="PAADM_TriageTime">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>31</Piece>
</Data>
<Data name="PAADM_TumourSiteGroup_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>53</Piece>
</Data>
<Data name="PAADM_Type">
<Delimiter>"^"</Delimiter>
<Piece>2</Piece>
</Data>
<Data name="PAADM_Type_of_Patient_Calc">
<Delimiter>"^"</Delimiter>
<Piece>65</Piece>
</Data>
<Data name="PAADM_UpdateDate">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>42</Piece>
</Data>
<Data name="PAADM_UpdateTime">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>43</Piece>
</Data>
<Data name="PAADM_UpdateUserHospital_DR">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>97</Piece>
</Data>
<Data name="PAADM_UpdateUser_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>44</Piece>
</Data>
<Data name="PAADM_Urgent">
<Delimiter>"^"</Delimiter>
<Piece>55</Piece>
</Data>
<Data name="PAADM_UsualAccom_DR">
<Delimiter>"^"</Delimiter>
<Node>3</Node>
<Piece>2</Piece>
</Data>
<Data name="PAADM_Verified">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>22</Piece>
</Data>
<Data name="PAADM_ViewablebyEpCareProv">
<Delimiter>"^"</Delimiter>
<Node>2</Node>
<Piece>86</Piece>
</Data>
<Data name="PAADM_VisitStatus">
<Delimiter>"^"</Delimiter>
<Piece>20</Piece>
</Data>
<Data name="PAADM_WaitList_DR">
<Delimiter>"^"</Delimiter>
<Node>1</Node>
<Piece>18</Piece>
</Data>
<Global>^PAADM</Global>
<RowIdSpec name="1">
<Expression>{L1}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<AccessType>sub</AccessType>
<Expression>{PAADM_RowID}</Expression>
<StartValue>1</StartValue>
</Subscript>
<Type>data</Type>
</SQLMap>
<SQLMap name="IndexAdmCurrentPat">
<Condition>$p({PAADM_VisitStatus},$c(1))="A"</Condition>
<ConditionFields>PAADM_VisitStatus,PAADM_Type</ConditionFields>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"AdmTypeCurr"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAdmDateCurrPat">
<Condition>$p({PAADM_VisitStatus},$c(1))="A"</Condition>
<ConditionFields>PAADM_AdmDate,PAADM_DischgDate,PAADM_VisitStatus</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>50</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"AdmDateCurr"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAdmDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"PAADM_DateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAdmPrRefDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"AdPrRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_Priority_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAdmTypeCurrLoc">
<Condition>$p({PAADM_VisitStatus},$c(1))="A"</Condition>
<ConditionFields>PAADM_VisitStatus,PAADM_AdmDate,PAADM_AdmTime,PAADM_DepCode_DR</ConditionFields>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L6}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"AdmTypeCurrLoc"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAdmissionDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"PAADM_AdmDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAdmissionType">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"PAADM_Type"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAdmref">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"AdmRef"</Expression>
</Subscript>
<Subscript name="2">
<Expression>$$ALPHAUP({PAADM_AdmRef})</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexAutocode">
<Condition>{PAADM_AutocodeRequired}["Y"</Condition>
<ConditionFields>PAADM_AutocodeRequired,PAADM_AdmDate</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"AutoCode"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexCodeDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"CODDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_CodingUpdateDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexCurrLoc">
<Condition>$p({PAADM_VisitStatus},$c(1))="A"</Condition>
<ConditionFields>PAADM_AdmDate,PAADM_AdmTime,PAADM_DepCode_DR,PAADM_VisitStatus</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"CurrLoc"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexCurrTypeLocDoc">
<Condition>$p({PAADM_VisitStatus},$c(1))="A"</Condition>
<ConditionFields>PAADM_VisitStatus,PAADM_AdmDocCodeDR,PAADM_DepCode_DR,PAADM_AdmDate,PAADM_AdmTime</ConditionFields>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L7}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"TypeLocDocDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDocCodeDR}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="7">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexCurrentWard">
<Condition>$p({PAADM_VisitStatus},$c(1))="A"</Condition>
<ConditionFields>PAADM_VisitStatus,PAADM_CurrentWard_DR,PAADM_CurrentRoom_DR</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>20</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"CurrWard"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_CurrentWard_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_CurrentRoom_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDSType">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DSType"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DaySurgeryType}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_VisitStatus}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDepDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DepDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDisDateDep">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DisDateDep"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DischgDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDischDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DischDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DischgDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDocDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"PAADM_DocDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_AdmDocCodeDR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDocRefDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DocRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_AdmDocCodeDR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDocRfStDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L6}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DocRfStDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDocCodeDR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_RefStat_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexDoctorCurrentPat">
<Condition>$$index^at83e({PAADM_VisitStatus})=1</Condition>
<ConditionFields>PAADM_AdmDocCodeDR,PAADM_AdmDate,PAADM_AdmTime</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>50</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"AdmDocDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDocCodeDR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexEpisSubTypeDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"SubTypeDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Epissubtype_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexEstimDischDate">
<Condition>$p({PAADM_VisitStatus},$c(1))'="D",{PAADM_DischgDate}="",{PAADM_EstimDischargeDate}'=""</Condition>
<ConditionFields>PAADM_DischgDate,PAADM_EstimDischargeDate,PAADM_VisitStatus</ConditionFields>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"EstDisch"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_EstimDischargeDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexEstimDischDateExt">
<Condition>{PAADM_EstimDischargeDate}'=""</Condition>
<ConditionFields>PAADM_DischgDate,PAADM_EstimDischargeDate</ConditionFields>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Subscript name="1">
<Expression>"EstDischExt"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_EstimDischargeDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexExpAdmDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"ExpAdmDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_ExpAdmDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexHCPPrRefDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"HCPrRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_HCPPriority_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexHospDischargeDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DischDateH"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Hospital_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DischgDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexIPDate">
<Condition>$p({PAADM_VisitStatus},$c(1))="P"</Condition>
<ConditionFields>PAADM_Type,PAADM_VisitStatus</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"IPDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexLocDateTime">
<Condition>$$index^at83e({PAADM_VisitStatus})=1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"PAADM_LocDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexLocRefDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"LocRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexLocRfStDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L6}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"LocRfStDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_RefStat_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexMajorIncident">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"MajInc"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_MajorIncident_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexMatVisType">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"MatVT"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_MaternityVisType_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexMother">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"Mother"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_MotherAdm_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexNotCompleted">
<Condition>{PAADM_Completed}["N"</Condition>
<ConditionFields>PAADM_Completed,PAADM_DepCode_DR,PAADM_Type</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"NotCompl"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexNotVerif1">
<Condition>{PAADM_Verified}["N"</Condition>
<ConditionFields>PAADM_DepCode_DR,PAADM_Type,PAADM_Verified</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"NotVerif1"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexNotVerified">
<Condition>{PAADM_Verified}["N"</Condition>
<ConditionFields>PAADM_Verified</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L2}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"NotVerif"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexNumber">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"No"</Expression>
</Subscript>
<Subscript name="2">
<Expression>$$ALPHAUP({PAADM_ADMNo})</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexNursingNotes">
<Condition>{PAADM_NursingNotesFlag}'["Y"</Condition>
<ConditionFields>PAADM_AdmDate,PAADM_DepCode_DR,PAADM_NursingNotesFlag</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"NNLoc"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexNursingNotesD">
<Condition>{PAADM_NursingNotesFlag}'["Y"</Condition>
<ConditionFields>PAADM_AdmDate,PAADM_AdmDocCodeDR,PAADM_NursingNotesFlag</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"NNDoc"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_AdmDocCodeDR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexNursingNotesType">
<Condition>{PAADM_NursingNotesFlag}'["Y"</Condition>
<ConditionFields>PAADM_NursingNotesFlag,PAADM_AdmDate,PAADM_Type</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"NNType"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexPAPMIDR">
<Global>^PAPERdr</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<AccessType>sub</AccessType>
<Expression>{PAADM_PAPMI_DR}</Expression>
</Subscript>
<Subscript name="2">
<AccessType>sub</AccessType>
<Expression>"ADM"</Expression>
</Subscript>
<Subscript name="3">
<AccessType>sub</AccessType>
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="4">
<AccessType>sub</AccessType>
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexParentWard">
<Condition>$p({PAADM_VisitStatus},$c(1))="A"</Condition>
<ConditionFields>PAADM_ParentWard_DR,PAADM_VisitStatus</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>20</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"ParentWard"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_ParentWard_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexPatietProcess">
<Condition>{PAADM_CurrentProcess_DR}'=""</Condition>
<ConditionFields>PAADM_CurrentProcess_DR,PAADM_PAPMI_DR</ConditionFields>
<Global>^PAPRi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"PAPMI"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_PAPMI_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_CurrentProcess_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexPregnancy">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"Pregn"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Pregnancy_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexPriority">
<Condition>$$index1^at83e({PAADM_VisitStatus},{PAADM_Type})=1</Condition>
<ConditionFields>PAADM_VisitStatus,PAADM_Type</ConditionFields>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"Priority"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_Priority_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_AdmDate}_","_+{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexPriorityDep">
<Condition>"A"[$p({PAADM_VisitStatus},$c(1)),{PAADM_CurrentWard_DR},'{PAADM_CurrentBed_DR}</Condition>
<ConditionFields>PAADM_AdmDate,PAADM_AdmTime,PAADM_DepCode_DR,PAADM_CurrentBed_DR,PAADM_Type,PAADM_VisitStatus,PAADM_CurrentWard_DR</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"PriorDep"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_Priority_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>+{PAADM_AdmDate}_","_+{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexProcess">
<Global>^PAPRi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"Process"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_CurrentProcess_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexRefDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexRefDoc">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RefDoc"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_PAPMI_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDocList_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexRefPrRefDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RefPrRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_ReferralPriority_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexRefStatDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RfStDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_RefStat_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexResDateTime">
<Condition>$$index^at83e({PAADM_VisitStatus})=1</Condition>
<ConditionFields>PAADM_VisitStatus,PAADM_AdmDate,PAADM_AdmTime,PAADM_CurrentResource_DR</ConditionFields>
<Global>^PAADMi</Global>
<PopulationPct>10</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"ResDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_CurrentResource_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexResDocDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L6}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"ResDocDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_CurrentResource_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_AdmDocCodeDR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexResLocDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L6}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"ResLocDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_CurrentResource_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexResRfStDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L6}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"ResRfStDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_CurrentResource_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>+{PAADM_RefStat_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexRfStRefDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RfStRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_RefStat_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexSrcAttendRefDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"SrcAttendRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_SourceOfAttend_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexStatRefDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"StatRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_VisitStatus}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexSubType">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"SubTypeDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Epissubtype_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexTempLoc">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"TempLoc"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_TempLoc_DR}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexTypeDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationPct>20</PopulationPct>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L5}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"TypeDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexTypeDepDateTime">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L6}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"TDepDateTime"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DepCode_DR}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_AdmDate}</Expression>
</Subscript>
<Subscript name="5">
<Expression>{PAADM_AdmTime}</Expression>
</Subscript>
<Subscript name="6">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexTypeDischdate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"DisDateT"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_Type}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_DischgDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexUpdateDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"UpdDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_UpdateDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexVisitStatus">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<AccessType>sub</AccessType>
<Expression>"PAADM_VisitStatus"</Expression>
</Subscript>
<Subscript name="2">
<AccessType>sub</AccessType>
<Expression>{PAADM_VisitStatus}</Expression>
</Subscript>
<Subscript name="3">
<AccessType>sub</AccessType>
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexrefExpDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RefExpDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_RefExpiryDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexrefTypeRefDate">
<Condition>1</Condition>
<Global>^PAADMi</Global>
<PopulationType>conditional</PopulationType>
<RowIdSpec name="1">
<Expression>{L4}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RfTpRefDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>+{PAADM_ReferralType}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RefDate}</Expression>
</Subscript>
<Subscript name="4">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SQLMap name="IndexrepDate">
<Global>^PAADMi</Global>
<PopulationType>nonnull</PopulationType>
<RowIdSpec name="1">
<Expression>{L3}</Expression>
<Field>PAADM_RowID</Field>
</RowIdSpec>
<Structure>delimited</Structure>
<Subscript name="1">
<Expression>"RepDate"</Expression>
</Subscript>
<Subscript name="2">
<Expression>{PAADM_ReportDate}</Expression>
</Subscript>
<Subscript name="3">
<Expression>{PAADM_RowID}</Expression>
</Subscript>
<Type>index</Type>
</SQLMap>
<SqlRowIdName>PAADM_RowID</SqlRowIdName>
<StreamLocation>^User.PAAdmS</StreamLocation>
<Type>%Storage.SQL</Type>
}

}
