
# Smart Urban Animal Management Platform

A location-aware platform designed to help residents and municipal authorities collaboratively monitor, identify, and manage stray dog populations in urban areas.

The platform combines community-reported sightings, verified animal records, geographic visualisation, risk assessment, and AI-assisted duplicate detection to support more efficient and informed urban animal management.

## Table of Contents

-   [Overview](#overview)
    
-   [Objectives](#objectives)
    
-   [Platform Architecture](#platform-architecture)
    
-   [1. Resident Interface](#1-resident-interface)
    
    -   [Reporting Dog Sightings](#reporting-dog-sightings)
        
    -   [Location and Image Metadata](#location-and-image-metadata)
        
    -   [Risk Assessment](#risk-assessment)
        
    -   [Interactive Map](#interactive-map)
        
    -   [Risk Hotspots](#risk-hotspots)
        
    -   [Verified Dog Records](#verified-dog-records)
        
-   [2. Authority Interface](#2-authority-interface)
    
    -   [Authority Authentication](#authority-authentication)
        
    -   [Sightings Management](#sightings-management)
        
    -   [Dog Identification and Grouping](#dog-identification-and-grouping)
        
    -   [Dog Movement Trajectory](#dog-movement-trajectory)
        
    -   [Verification and Case Closure](#verification-and-case-closure)
        
    -   [Official Dog Records](#official-dog-records)
        
-   [3. Backend Processing and AI-Assisted Identification](#3-backend-processing-and-ai-assisted-identification)
    
-   [4. Data Management](#4-data-management)
    
-   [5. Telegram Integration](#5-telegram-integration)
    
-   [6. Report Lifecycle](#6-report-lifecycle)
    
-   [7. Reliability and Data Integrity](#7-reliability-and-data-integrity)
    
-   [Expected Impact](#expected-impact)
    

----------

## Overview

Information about stray dogs is often distributed among residents, animal welfare organisations, veterinary professionals, and municipal authorities. This can make it difficult to maintain accurate animal records, identify duplicate reports, monitor vaccination coverage, and coordinate interventions.

The Smart Urban Animal Management Platform aims to address these challenges by creating a centralised system where residents can report stray dog sightings and authorities can review reports, maintain verified records, and coordinate appropriate action.

The platform is built around two primary interfaces:

1.  **Resident Interface:** Enables residents to report sightings, assess potential risks, explore nearby reports, and access official dog records.
    
2.  **Authority Interface:** Enables authorised personnel to review sightings, identify individual dogs across multiple reports, monitor their reported movements, maintain official records, and manage cases.
    

The system maintains a distinction between information submitted by the public and information verified by authorised personnel.

## Objectives

The primary objectives of the platform are to:

-   Create a centralised database of stray dog sightings.
    
-   Enable residents to contribute information about dogs in their neighbourhoods.
    
-   Identify potential duplicate sightings of the same dog.
    
-   Help authorities locate reported dogs using geographic information.
    
-   Visualise dog sightings, reported movements, and potential risk hotspots.
    
-   Maintain official records of identified, tagged, vaccinated, and sterilised dogs.
    
-   Track reports from initial submission through verification and resolution.
    
-   Provide a structured information system to support urban animal management.
    

----------

## Platform Architecture

The platform organises its information into two primary data repositories.

### 1. Stray Dog Sightings Database

This repository stores individual reports submitted by residents.

A sighting may contain:

-   Photographs of the dog.
    
-   Date and time of the report.
    
-   Geographic coordinates, when available.
    
-   A description of nearby landmarks.
    
-   Answers to risk-assessment questions.
    
-   Information about reported incidents.
    
-   A status indicating whether the report is open or closed.
    
-   A reference to an existing dog profile when a match is established.
    

Multiple sightings may correspond to the same physical dog.

### 2. Verified Dogs Database

This repository stores official records of dogs that have been identified and verified by authorised personnel.

A verified dog profile may contain:

-   A unique identification number.
    
-   Photographs and identifying characteristics.
    
-   Verified identification or tagging status.
    
-   Official vaccination records.
    
-   Official sterilisation records.
    
-   Relevant medical or intervention history.
    
-   The date of verification.
    
-   The current status of associated reports.
    

Each verified dog receives a unique system-generated identifier that can be used to associate future sightings with its profile.

The two repositories serve different purposes: one records observations made in the field, while the other maintains official animal records.

----------

# 1. Resident Interface

The resident interface is designed to make reporting and accessing information about stray dogs straightforward.

Residents can contribute sightings without needing to establish the dog's official identity.

The interface provides two primary functions:

-   **Reporting Interface:** For submitting new dog sightings.
    
-   **Browsing Interface:** For viewing existing sightings, risk information, and verified dog records.
    

## Reporting Dog Sightings

Residents can report a stray dog by visiting the reporting section of the website.

The reporting process consists of the following steps.

### Step 1: Submit a Photograph

Residents can either:

-   Capture a photograph through the website, where the device and browser support it.
    
-   Upload an existing photograph from their device.
    

The photograph provides visual information that can help authorities identify the dog and help the backend associate multiple sightings of the same animal.

### Step 2: Provide Location Information

Residents can provide information about where the dog was seen.

The platform may obtain location information from:

-   Geographic metadata embedded in the uploaded photograph, when available.
    
-   A location selected manually on an interactive map.
    
-   A text-based description of nearby landmarks.
    

Examples of landmark descriptions include nearby roads, parks, bus stops, buildings, shops, or other recognisable locations.

Providing landmark information helps authorities locate the reported dog when exact coordinates are unavailable or unreliable.

### Step 3: Provide Additional Details

Residents can answer a set of predefined questions about the sighting.

These questions may cover:

-   Whether the dog appeared injured or unwell.
    
-   Whether the dog was reported to have injured or attacked someone recently.
    
-   Whether the resident observed threatening or concerning behaviour.
    
-   Whether the location has high pedestrian activity.
    
-   Whether there are other relevant circumstances that authorities should know about.
    

The platform records these answers as public observations rather than treating them as confirmed facts.

### Step 4: Submit the Report

Once submitted, the sighting is stored in the sightings database.

The system processes the available image and location information, checks for potential matches with existing reports, and makes the sighting available for the appropriate map and review workflows.

A new sighting does not automatically create an officially verified dog record.

## Location and Image Metadata

Photographs may contain metadata describing when and where they were captured.

When available, the platform can extract:

-   Geographic coordinates.
    
-   Capture date and time.
    

This information helps establish the location and chronology of a sighting.

The extracted information can be used to:

-   Display sightings on a map.
    
-   Compare a new sighting with previously reported locations.
    
-   Assist in identifying duplicate reports.
    
-   Reconstruct the reported movement history of an individual dog.
    
-   Help authorities locate a dog in the field.
    

Image metadata is not always available. It may be absent, inaccurate, or removed when photographs are edited or shared through messaging services.

Therefore, the platform should allow residents to provide a location manually when metadata cannot be obtained. Metadata-derived locations and dates should also be distinguished from manually reported information.

## Risk Assessment

Each sighting can include a structured risk assessment based on the information supplied by the reporting resident.

Potential assessment factors include:

-   Reported incidents involving injury or attacks.
    
-   Recent observations of concerning behaviour.
    
-   Whether an animal appears injured or distressed.
    
-   Pedestrian activity in the surrounding area.
    
-   The recency of the sighting.
    
-   Other contextual information relevant to the incident.
    

These factors help authorities understand which reports may require more immediate attention.

The platform can calculate a preliminary risk indicator from the available information. Reports may then be organised according to their assessed priority.

A reported incident should not automatically establish that a dog is dangerous. Risk assessments based on public submissions must remain distinguishable from incidents investigated or confirmed by authorised personnel.

## Interactive Map

The resident interface includes an interactive map showing reported dog sightings within the selected geographic area.

Residents can use the map to:

-   Explore sightings in their neighbourhood.
    
-   View reports near their current or selected location.
    
-   Select individual sightings to inspect their available information.
    
-   Review reported risk factors and incident history.
    
-   View verified dog profiles and official records.
    
-   Filter sightings by relevant status or other available attributes.
    

Individual map markers represent sightings, while multiple reports associated with the same identified dog can be linked through the system's matching process.

The map is intended to provide residents with access to relevant public information while helping them understand the animal-related concerns reported in their area.

## Risk Hotspots

The platform can highlight geographic areas where the available reports indicate a potentially elevated level of concern.

Hotspot severity may be calculated using several factors, including:

-   The number of reported dogs in an area.
    
-   The number and nature of reported incidents.
    
-   The recency of relevant sightings.
    
-   The assessed priority of individual reports.
    
-   The pedestrian activity of the surrounding area, when reliable information is available.
    

The resulting map may use different visual indicators to distinguish areas with different levels of reported risk.

Hotspots are intended to support awareness and help authorities identify locations that may need further assessment. They should not be interpreted as proof that every dog in a highlighted area poses a danger.

The platform should also account for the freshness and reliability of the underlying data. A cluster of old or unverified reports should not automatically be treated as evidence of a current threat.

## Verified Dog Records

Residents can access public information about dogs officially registered by authorised personnel.

Depending on the available records, a verified profile may display:

-   The dog's unique identification number.
    
-   Photographs and identifying characteristics.
    
-   Official tagging status.
    
-   Verified vaccination information.
    
-   Verified sterilisation information.
    
-   Relevant medical information approved for public display.
    
-   Whether associated intervention cases have been resolved.
    

This allows residents to distinguish officially recorded information from unverified sightings.

Only authorised personnel can create or modify official verification records.

----------

# 2. Authority Interface

The authority interface provides a central dashboard for authorised municipal personnel and other approved animal-management professionals.

It is designed to support the review of public reports, identification of individual dogs, maintenance of official records, and monitoring of ongoing cases.

## Authority Authentication

Access to restricted authority functions requires authentication.

Authorised personnel can use the dashboard to perform actions that are unavailable to ordinary residents, including:

-   Reviewing and validating reported information.
    
-   Confirming or rejecting proposed matches between sightings.
    
-   Linking sightings to identified dogs.
    
-   Creating and updating official dog records.
    
-   Updating vaccination and sterilisation information.
    
-   Marking reports as resolved.
    
-   Reviewing closed cases.
    

The system should restrict these actions to appropriately authorised accounts.

Public users may view permitted records but cannot modify official medical records or independently close reports.

## Sightings Management

The authority dashboard displays dog sightings on an interactive map.

Authorities can inspect the information associated with a sighting, including:

-   The submitted photograph.
    
-   Reported location and nearby landmarks.
    
-   Date and time information.
    
-   Risk-assessment responses.
    
-   Available incident history.
    
-   The current report status.
    
-   Potential matches to other sightings.
    

Authorities can use these details to assess reports and determine whether additional investigation or intervention is required.

Reports may be filtered according to location, date, status, assessed priority, and whether an associated dog profile has been established.

Closed reports are hidden by default to keep the primary dashboard focused on outstanding cases. An appropriate filter allows authorised personnel to display closed cases when required.

## Dog Identification and Grouping

A single dog may be reported by multiple residents at different times and locations.

The authority interface therefore supports the grouping of sightings that are believed to represent the same individual dog.

The backend analyses photographs and available contextual information to suggest potential matches.

When appropriate, authorities can review the suggestions and confirm whether multiple sightings belong to the same dog.

Once sightings have been associated with a particular animal, the authority dashboard can present them together rather than displaying each report as an unrelated case.

This helps authorities understand the history of an individual animal and reduces duplicate case handling.

Automated matching is intended to assist the review process. Where identification is uncertain, human review should take precedence over automatically merging records.

## Dog Movement Trajectory

For an individual dog with multiple associated sightings, the authority interface can display a chronological representation of its reported locations.

The trajectory view uses the geographic coordinates and dates associated with the available sightings.

It can help authorities understand:

-   The areas where the dog has been observed.
    
-   Whether sightings are concentrated around a particular location.
    
-   Whether the dog appears to move between neighbourhoods.
    
-   The most recent reported location.
    
-   The sequence of sightings over time.
    

The map may connect successive sightings to provide a visual representation of the dog's reported movement history.

These connections represent the sequence of observations, not a confirmed path travelled by the dog.

The usefulness of the trajectory depends on the accuracy of the reported locations, dates, and identification matches.

## Verification and Case Closure

After locating and examining a reported dog, authorised personnel can record the outcome of their intervention.

Depending on the situation, they may:

1.  Confirm the identity of the dog.
    
2.  Create or update its official profile.
    
3.  Record relevant tagging information.
    
4.  Update verified vaccination or sterilisation records.
    
5.  Associate relevant sightings with the identified dog.
    
6.  Mark the appropriate report or case as resolved.
    

Once the required intervention has been completed, the authority can close the relevant case.

Closed reports are hidden from the default map views for both residents and authorities. Users can change the relevant filter to view historical reports and verified records.

Closing a report does not delete its underlying history. The information remains available for authorised review and historical analysis.

The system should distinguish between verifying a dog's identity and resolving a particular case. For example, identifying a dog does not necessarily mean that every medical or welfare concern associated with it has been addressed.

## Official Dog Records

Authorities can publish and maintain verified records for dogs they have officially identified or tagged.

Each profile receives a unique identifier that distinguishes the animal from other registered dogs.

The profile serves as a central reference for:

-   Verified identity information.
    
-   Official tagging status.
    
-   Vaccination history.
    
-   Sterilisation status.
    
-   Relevant interventions.
    
-   Associated sightings and historical reports.
    

When a newly verified dog matches one or more existing sightings, those reports can be linked to the dog's profile.

This creates a connection between community observations and official animal records.

Published records are available to residents according to the platform's public information policy. Changes to official records remain restricted to authorised users.

----------

# 3. Backend Processing and AI-Assisted Identification

The backend is responsible for processing submitted reports, analysing photographs, comparing sightings, and maintaining the relationships between reports and individual dogs.

A major component of this process is AI-assisted duplicate detection.

## Image Similarity Analysis

When a resident submits a photograph, the system analyses its visual characteristics to help identify potential matches among existing sightings and verified dog records.

The analysis may consider visible features such as:

-   Coat colour and pattern.
    
-   Distinctive markings.
    
-   Facial and body characteristics.
    
-   Other visually identifiable features.
    

The system compares the new photograph with relevant images already stored in the platform.

The objective is to identify candidate matches rather than assume that visually similar dogs are necessarily the same individual.

## Geographic and Temporal Validation

Image similarity alone is insufficient for reliable identification.

Two different dogs may have similar appearances, while photographs of the same dog may look different because of lighting, pose, image quality, or viewing angle.

The backend therefore combines visual similarity with geographic and temporal information.

For each candidate match, the system may consider:

-   The distance between the reported locations.
    
-   The time elapsed between sightings.
    
-   The plausibility of the dog's movement between those locations.
    
-   The quality and confidence of the visual match.
    
-   Whether the available information supports the proposed identification.
    

For example, two visually similar dogs reported thousands of kilometres apart within a short period should not automatically be treated as the same animal.

Geographic and temporal checks help identify implausible matches and reduce false associations.

The system may assign confidence levels to proposed matches and send uncertain cases for manual review.

## Associating Sightings with Individual Dogs

The identification process can produce one of several outcomes:

-   **Potential match found:** The sighting may correspond to an existing dog.
    
-   **Multiple possible matches:** Further review is required.
    
-   **No suitable match found:** The sighting remains unlinked until additional evidence becomes available.
    
-   **Match verified:** The sighting is associated with the appropriate dog profile.
    

When a match is confirmed, the platform links the relevant sightings so that the dog's location history can be reconstructed.

When an official profile is subsequently created, confirmed related sightings can be associated with that profile.

The system should retain the original reports and their individual details rather than replacing the information with a single aggregated record.

----------

# 4. Data Management

The platform maintains separate repositories for public sightings and officially verified dog records.

The distinction is important because a reported observation and an official record have different levels of verification.

## Sighting Records

Each sighting represents an observation submitted by a resident.

A sighting can exist without an associated verified dog profile.

Its information may include photographs, reported location, date, landmark descriptions, risk responses, and case status.

A sighting may later be associated with an existing dog or with a newly verified dog profile.

## Verified Dog Records

Each verified dog record represents an individual animal identified through the authorised verification process.

Its information includes the assigned identifier and relevant official records.

A verified profile may be associated with multiple sightings over time.

## Relationships Between the Repositories

The relationship between the two repositories can be represented as follows:

**One dog → Multiple sightings → One consolidated movement history**

A sighting may initially have no verified dog association. Once a match is established, it can be linked to the relevant profile.

The system should support uncertain matches without forcing a premature identification.

Official vaccination and sterilisation information must remain distinct from resident-submitted claims about those conditions.

## Record Visibility and Status

The platform distinguishes between open reports, closed reports, and verified dog records.

-   **Open reports:** Cases that remain available for review or intervention.
    
-   **Closed reports:** Cases marked as resolved by an authorised user.
    
-   **Verified dog records:** Official profiles maintained by authorised personnel.
    

The default public and authority views prioritise open reports. Users can apply filters to view closed cases and verified records.

Record status changes should not erase the underlying history.

----------

# 5. Telegram Integration

The platform plans to support Telegram as an additional reporting channel.

This would allow residents to report sightings without having to open the website for every submission.

Through a Telegram-based reporting workflow, users may be able to:

-   Submit a dog photograph.
    
-   Provide a description of the location.
    
-   Share a location where supported.
    
-   Answer structured risk-assessment questions.
    
-   Submit a sighting for processing.
    

Reports received through Telegram would enter the same underlying reporting workflow as reports submitted through the website.

The system would process the available information, check for potential duplicate sightings, and make eligible reports available through the resident map and authority dashboard.

Where Telegram removes image metadata or does not provide reliable coordinates, the reporting process should request a location pin or a description of nearby landmarks.

----------

# Expected Impact

The Smart Urban Animal Management Platform aims to improve the coordination of stray dog management by connecting community observations with official animal records.

Its intended benefits include:

-   **Better information sharing:** Residents and authorised personnel can access a shared view of relevant sightings and official records.
    
-   **Reduced duplication:** AI-assisted matching can help associate multiple sightings with the same animal.
    
-   **Improved geographic awareness:** Maps and trajectory visualisations can help authorities understand where dogs have been observed.
    
-   **More informed prioritisation:** Structured reports and geographic analysis can help direct attention towards cases requiring further assessment.
    
-   **Improved record continuity:** Individual dog profiles can connect sightings, official identification, and intervention history.
    
-   **Greater transparency:** Residents can access permitted information about verified records and report outcomes.
    
-   **More efficient coordination:** A unified workflow can reduce fragmented reporting and support more organised municipal operations.
    

Ultimately, the platform aims to transform scattered community observations into structured, location-aware information that supports responsible, humane, and data-informed urban animal management.

