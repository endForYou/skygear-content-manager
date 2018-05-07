import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as process from 'process';

// tslint:disable:object-literal-sort-keys
test('parseCmsConfig should parse example config', () => {
  const text = fs.readFileSync(process.cwd() + '/example/cms-config.yaml', {
    encoding: 'utf-8',
  });
  const parsed = yaml.safeLoad(text);
  expect(parsed).toEqual({
    timezone: 'America/New_York',
    site: [
      { type: 'UserManagement' },
      { type: 'Record', name: 'user', label: 'User' },
      { type: 'Record', name: 'joblisting', label: 'Joblisting' },
      { type: 'Record', name: 'job_application', label: 'Job Application' },
      { type: 'Record', name: 'job_suggestion', label: 'Job Suggestion' },
      { type: 'Record', name: 'imported_user', label: 'Imported User' },
      { type: 'Record', name: 'skill', label: 'Skill' },
      { type: 'Record', name: 'cfunction', label: 'Cfunction' },
      { type: 'Record', name: 'city', label: 'City' },
      { type: 'Record', name: 'country', label: 'Country' },
      { type: 'Record', name: 'welcome_message', label: 'Welcome Message' },
      { type: 'PushNotifications' },
    ],
    imports: {
      'import-user': {
        record_type: 'user',
        fields: [{ name: '_id' }, { name: 'email' }],
      },
      'import-user-with-name': {
        record_type: 'user',
        identifier: 'name',
        duplicate_reference_handling: 'use-first',
        fields: [{ name: 'name' }, { name: 'email' }],
      },
      'import-user-with-name-strict': {
        record_type: 'user',
        identifier: 'name',
        duplicate_reference_handling: 'throw-error',
        fields: [{ name: 'name' }, { name: 'email' }],
      },
      'import-user-country': {
        record_type: 'user',
        identifier: 'name',
        fields: [
          { name: 'name' },
          { name: 'email' },
          {
            name: 'country',
            reference_target: 'country',
            reference_field_name: 'display_name',
          },
        ],
      },
    },
    exports: {
      'export-user': {
        record_type: 'user',
        fields: [
          { name: '_id', label: 'id' },
          { name: 'name' },
          { name: '_created_at' },
          { name: '_updated_at' },
          { name: 'email', label: 'Email' },
          {
            name: 'city',
            label: 'City',
            reference_target: 'city',
            reference_field_name: '_id',
          },
          {
            name: 'country',
            label: 'Country',
            reference_target: 'country',
            reference_field_name: 'display_name',
          },
          {
            name: 'has_skills',
            label: 'Has skills',
            reference_target: 'skill',
            reference_field_name: '_id',
            reference_via_association_record: 'user_has_skill',
          },
          {
            name: 'has_skills_spread',
            reference_target: 'skill',
            reference_via_association_record: 'user_has_skill',
            reference_fields: [
              { name: '_id', label: 'Skill {index} - ID' },
              { name: 'display_name', label: 'Skill {index} - Name' },
            ],
          },
          {
            name: 'countries',
            reference_from_field: 'creator',
            reference_via_back_reference: 'country',
            reference_fields: [
              { name: '_id', label: 'Country {index} - ID' },
              { name: 'display_name', label: 'Country {index} - Name' },
            ],
          },
          { name: 'json', label: 'Data' },
          { name: 'location', label: 'Location' },
        ],
      },
    },
    records: {
      user: {
        list: {
          predicates: [
            { name: 'name', predicate: 'NotLike', value: '%admin%' },
            {
              name: '_created_at',
              predicate: 'GreaterThan',
              value: new Date('2018-01-01T00:00:00.000Z'),
            },
            {
              name: 'city',
              predicate: 'NotEqualTo',
              valueType: 'Reference',
              value: { reference_target: 'city', reference_id: 'hk' },
            },
          ],
          default_sort: { name: 'name', ascending: false },
          fields: [
            { type: '_id' },
            { name: 'name', type: 'String' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'email', type: 'String' },
            { name: 'profile_image', type: 'ImageAsset' },
            { name: 'cv', type: 'FileAsset' },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            { name: 'score', type: 'Number' },
          ],
          filters: [
            { name: 'name', type: 'String' },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: 'display_name',
              nullable: true,
            },
          ],
          actions: [
            { type: 'Import', name: 'import-user', label: 'Import user' },
            {
              type: 'Import',
              name: 'import-user-with-name',
              label: 'Import user with name',
            },
            {
              type: 'Import',
              name: 'import-user-with-name-strict',
              label: 'Import user with name (Strict)',
            },
            {
              type: 'Import',
              name: 'import-user-country',
              label: 'Import user country',
            },
            { type: 'Export', name: 'export-user' },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { name: 'name', type: 'String' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'email', type: 'String' },
            { name: 'profile_image', type: 'ImageAsset' },
            { name: 'cv', type: 'FileAsset' },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            {
              name: 'has_skills',
              label: 'Has skills',
              type: 'Reference',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'user_has_skill',
            },
            {
              name: 'wants_skills',
              label: 'Wants skills',
              type: 'Reference',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'user_wants_skill',
            },
            {
              name: 'has_cfunctions',
              label: 'Has cfunctions',
              type: 'Reference',
              reference_target: 'cfunction',
              reference_field_name: '_id',
              reference_via_association_record: 'user_has_cfunction',
            },
            {
              name: 'wants_cfunctions',
              label: 'Wants cfunctions',
              type: 'Reference',
              reference_target: 'cfunction',
              reference_field_name: '_id',
              reference_via_association_record: 'user_wants_cfunction',
            },
            {
              name: 'applications',
              type: 'Reference',
              label: 'Applications',
              reference_target: 'joblisting',
              reference_field_name: 'proj_name',
              reference_via_association_record: 'job_application',
            },
            { name: 'score', type: 'Number' },
          ],
        },
        edit: {
          fields: [
            { name: 'name', type: 'String' },
            { name: 'profile_image', type: 'ImageAsset', nullable: false },
            {
              name: 'cv',
              type: 'FileAsset',
              accept: 'application/pdf,image/*',
            },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            {
              name: 'has_skills',
              label: 'Has skills',
              type: 'Reference',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'user_has_skill',
            },
            {
              name: 'wants_skills',
              label: 'Wants skills',
              type: 'Reference',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'user_wants_skill',
            },
            {
              name: 'has_cfunctions',
              label: 'Has cfunctions',
              type: 'Reference',
              reference_target: 'cfunction',
              reference_field_name: '_id',
              reference_via_association_record: 'user_has_cfunction',
            },
            {
              name: 'wants_cfunctions',
              label: 'Wants cfunctions',
              type: 'Reference',
              reference_target: 'cfunction',
              reference_field_name: '_id',
              reference_via_association_record: 'user_wants_cfunction',
            },
            { name: 'score', type: 'Number' },
          ],
        },
        new: {
          fields: [
            { name: 'name', type: 'String' },
            { name: 'cv', type: 'FileAsset' },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            {
              name: 'has_skills',
              label: 'Has skills',
              type: 'Reference',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'user_has_skill',
            },
            {
              name: 'wants_skills',
              label: 'Wants skills',
              type: 'Reference',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'user_wants_skill',
            },
            {
              name: 'has_cfunctions',
              label: 'Has cfunctions',
              type: 'Reference',
              reference_target: 'cfunction',
              reference_field_name: '_id',
              reference_via_association_record: 'user_has_cfunction',
            },
            {
              name: 'wants_cfunctions',
              label: 'Wants cfunctions',
              type: 'Reference',
              reference_target: 'cfunction',
              reference_field_name: '_id',
              reference_via_association_record: 'user_wants_cfunction',
            },
            { name: 'score', type: 'Number' },
          ],
        },
      },
      skill: {
        list: {
          fields: [{ type: '_id' }, { name: 'display_name', type: 'String' }],
          actions: [
            {
              type: 'Link',
              label: 'Search skills',
              href: 'https://www.google.com/search?q=skill',
              target: '_blank',
            },
            { type: 'AddButton' },
          ],
          item_actions: [
            {
              type: 'Link',
              label: 'Search',
              href: 'https://www.google.com/search?q={record.display_name}',
              target: '_blank',
            },
            { type: 'ShowButton' },
            { type: 'EditButton' },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'display_name', type: 'String' },
            { name: 'description', type: 'WYSIWYG' },
          ],
        },
        edit: {
          fields: [
            { name: 'display_name', type: 'String' },
            {
              name: 'class',
              label: 'Class',
              type: 'Dropdown',
              null: { enabled: false, label: 'Unclassified' },
              custom: { enabled: true },
              options: [
                { label: 'Class A', value: 'A' },
                { label: 'Class B', value: 'B' },
                { label: 'Class S', value: 'S' },
              ],
            },
            { name: 'description', type: 'WYSIWYG' },
          ],
        },
        new: {
          fields: [
            { name: 'display_name', type: 'String' },
            { name: 'description', type: 'WYSIWYG' },
          ],
        },
      },
      cfunction: {
        list: {
          fields: [{ type: '_id' }, { name: 'display_name', type: 'String' }],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'display_name', type: 'String' },
          ],
        },
        edit: { fields: [{ name: 'display_name', type: 'String' }] },
        new: { fields: [{ name: 'display_name', type: 'String' }] },
      },
      city: {
        list: {
          fields: [{ type: '_id' }],
          filters: [
            {
              name: 'display_name',
              type: 'String',
              label: 'Name',
              nullable: true,
            },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'display_name', type: 'String' },
            {
              name: 'users',
              type: 'EmbeddedReference',
              label: 'Users',
              reference_from_field: 'city',
              reference_via_back_reference: 'user',
              reference_fields: [
                { type: '_id' },
                { name: 'name', type: 'String' },
                {
                  name: 'last_login_at',
                  type: 'DateTime',
                  timezone: 'Europe/London',
                },
                { name: 'boolean', type: 'Boolean' },
                {
                  name: 'has_skills',
                  label: 'Has skills',
                  type: 'Reference',
                  reference_target: 'skill',
                  reference_field_name: '_id',
                  reference_via_association_record: 'user_has_skill',
                },
                {
                  name: 'countries',
                  type: 'EmbeddedReference',
                  label: 'Created Countries',
                  reference_from_field: 'creator',
                  reference_via_back_reference: 'country',
                  reference_fields: [
                    { type: '_created_at' },
                    { name: 'display_name', type: 'String' },
                  ],
                },
              ],
            },
          ],
        },
        edit: {
          fields: [
            { name: 'display_name', type: 'String' },
            {
              name: 'users',
              type: 'EmbeddedReference',
              label: 'Users',
              reference_from_field: 'city',
              reference_via_back_reference: 'user',
              reference_fields: [
                { type: '_id' },
                { name: 'name', type: 'String' },
                { name: 'last_login_at', type: 'DateTime', timezone: 'Local' },
                { name: 'boolean', type: 'Boolean' },
                {
                  name: 'has_skills',
                  label: 'Has skills',
                  type: 'Reference',
                  reference_target: 'skill',
                  reference_field_name: '_id',
                  reference_via_association_record: 'user_has_skill',
                },
              ],
            },
          ],
        },
        new: { fields: [{ name: 'display_name', type: 'String' }] },
      },
      country: {
        list: {
          fields: [{ type: '_id' }],
          actions: [
            {
              type: 'Import',
              name: 'import-country',
              fields: [{ name: 'display_name' }],
            },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            {
              name: 'cities',
              type: 'EmbeddedReference',
              label: 'Cities',
              reference_from_field: 'country',
              reference_via_back_reference: 'city',
              reference_position_field: 'position',
              reference_position_ascending: false,
              reference_fields: [{ name: 'display_name', type: 'String' }],
            },
          ],
        },
        edit: {
          fields: [
            { name: 'display_name', type: 'String' },
            {
              name: 'cities',
              type: 'EmbeddedReference',
              label: 'Cities',
              reference_from_field: 'country',
              reference_via_back_reference: 'city',
              reference_position_field: 'position',
              reference_position_ascending: false,
              reference_delete_action: 'delete-record',
              reference_fields: [
                { type: '_id' },
                { name: 'display_name', type: 'String' },
              ],
            },
          ],
        },
        new: {
          fields: [
            { name: 'display_name', type: 'String' },
            {
              name: 'cities',
              type: 'EmbeddedReference',
              label: 'Cities',
              reference_from_field: 'country',
              reference_via_back_reference: 'city',
              reference_fields: [
                { type: '_id' },
                { name: 'display_name', type: 'String' },
              ],
            },
          ],
        },
      },
      welcome_message: {
        list: {
          fields: [
            { name: 'ordering', type: 'Integer' },
            { name: 'text_en', type: 'String', label: 'English' },
          ],
          item_actions: [],
        },
        show: {
          fields: [
            { name: 'ordering', type: 'Integer' },
            { name: 'text_en', type: 'String', label: 'English' },
            { name: 'text_ja', type: 'String', label: 'Japanese' },
          ],
        },
        edit: {
          fields: [
            { name: 'text_en', type: 'String', label: 'en' },
            { name: 'text_ja', type: 'String', label: 'ja' },
          ],
        },
        new: {
          fields: [
            { name: 'text_en', type: 'String', label: 'en' },
            { name: 'text_ja', type: 'String', label: 'ja' },
          ],
        },
      },
      job_application: {
        list: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'manager_interested', type: 'Boolean' },
            { name: 'manager_passed', type: 'Boolean' },
            { name: 'applicant_interested', type: 'Boolean' },
            { name: 'applicant_passed', type: 'Boolean' },
            { name: 'matched_at', type: 'DateTime' },
            {
              name: 'applicant_id',
              type: 'Reference',
              label: 'Applicant',
              reference_target: 'user',
              reference_field_name: 'name',
            },
            {
              name: 'joblisting_id',
              type: 'Reference',
              label: 'Job',
              reference_target: 'joblisting',
              reference_field_name: 'proj_name',
            },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'manager_interested', type: 'Boolean' },
            { name: 'manager_passed', type: 'Boolean' },
            { name: 'applicant_interested', type: 'Boolean' },
            { name: 'applicant_passed', type: 'Boolean' },
            { name: 'matched_at', type: 'DateTime' },
            {
              name: 'applicant_id',
              type: 'Reference',
              label: 'Applicant',
              reference_target: 'user',
              reference_field_name: 'name',
            },
            {
              name: 'joblisting_id',
              type: 'Reference',
              label: 'Job',
              reference_target: 'joblisting',
              reference_field_name: 'proj_name',
            },
          ],
        },
      },
      joblisting: {
        list: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'proj_name', type: 'String', label: 'Project name' },
            { name: 'role', type: 'String' },
            { name: 'proj_type', type: 'String', label: 'Project type' },
            {
              name: 'manager_id',
              type: 'Reference',
              label: 'Manager',
              reference_target: 'user',
              reference_field_name: 'name',
            },
            { name: 'role_description', type: 'String' },
            {
              name: 'cfunction_id',
              type: 'Reference',
              label: 'Cfunction',
              reference_target: 'cfunction',
              reference_field_name: '_id',
            },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            {
              name: 'proj_start_date',
              type: 'DateTime',
              label: 'Project Start Date',
            },
            {
              name: 'proj_end_date',
              type: 'DateTime',
              label: 'Project End Date',
            },
            {
              name: 'required_availability',
              type: 'Integer',
              label: 'Required availability',
            },
            {
              name: 'listing_closing_date',
              type: 'DateTime',
              label: 'Listing closing date',
            },
            {
              name: 'offers_skill',
              type: 'Reference',
              label: 'Offers skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_offers_skill',
            },
            {
              name: 'requires_skill',
              type: 'Reference',
              label: 'Requires skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_requires_skill',
            },
            {
              name: 'applicants',
              type: 'Reference',
              label: 'Appplicants',
              reference_target: 'user',
              reference_field_name: 'name',
              reference_via_association_record: 'job_application',
            },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'proj_name', type: 'String', label: 'Project name' },
            { name: 'role', type: 'String' },
            { name: 'proj_type', type: 'String', label: 'Project type' },
            {
              name: 'manager_id',
              type: 'Reference',
              label: 'Manager',
              reference_target: 'user',
              reference_field_name: 'name',
            },
            { name: 'role_description', type: 'String' },
            {
              name: 'cfunction_id',
              type: 'Reference',
              label: 'Cfunction',
              reference_target: 'cfunction',
              reference_field_name: '_id',
            },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            {
              name: 'proj_start_date',
              type: 'DateTime',
              label: 'Project Start Date',
            },
            {
              name: 'proj_end_date',
              type: 'DateTime',
              label: 'Project End Date',
            },
            {
              name: 'required_availability',
              type: 'Integer',
              label: 'Required availability',
            },
            {
              name: 'listing_closing_date',
              type: 'DateTime',
              label: 'Listing closing date',
            },
            {
              name: 'offers_skill',
              type: 'Reference',
              label: 'Offers skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_offers_skill',
            },
            {
              name: 'requires_skill',
              type: 'Reference',
              label: 'Requires skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_requires_skill',
            },
            {
              name: 'applicants',
              type: 'Reference',
              label: 'Appplicants',
              reference_target: 'user',
              reference_field_name: 'name',
              reference_via_association_record: 'job_application',
            },
          ],
        },
        edit: {
          fields: [
            { name: 'proj_name', type: 'String', label: 'Project name' },
            { name: 'role', type: 'String' },
            { name: 'role_description', type: 'String' },
            {
              name: 'cfunction_id',
              type: 'Reference',
              label: 'Cfunction',
              reference_target: 'cfunction',
              reference_field_name: '_id',
            },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            {
              name: 'required_availability',
              type: 'Integer',
              label: 'Required availability',
            },
            {
              name: 'offers_skill',
              type: 'Reference',
              label: 'Offers skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_offers_skill',
            },
            {
              name: 'requires_skill',
              type: 'Reference',
              label: 'Requires skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_requires_skill',
            },
          ],
        },
        new: {
          fields: [
            { name: 'proj_name', type: 'String', label: 'Project name' },
            { name: 'role', type: 'String' },
            { name: 'role_description', type: 'String' },
            {
              name: 'cfunction_id',
              type: 'Reference',
              label: 'Cfunction',
              reference_target: 'cfunction',
              reference_field_name: '_id',
            },
            {
              name: 'city',
              type: 'Reference',
              label: 'City',
              reference_target: 'city',
              reference_field_name: '_id',
            },
            {
              name: 'country',
              type: 'Reference',
              label: 'Country',
              reference_target: 'country',
              reference_field_name: '_id',
            },
            {
              name: 'required_availability',
              type: 'Integer',
              label: 'Required availability',
            },
            {
              name: 'offers_skill',
              type: 'Reference',
              label: 'Offers skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_offers_skill',
            },
            {
              name: 'requires_skill',
              type: 'Reference',
              label: 'Requires skills',
              reference_target: 'skill',
              reference_field_name: '_id',
              reference_via_association_record: 'joblisting_requires_skill',
            },
          ],
        },
      },
      job_suggestion: {
        list: {
          fields: [
            { type: '_id' },
            {
              name: 'joblisting_id',
              type: 'Reference',
              label: 'Joblisting',
              reference_target: 'joblisting',
              reference_field_name: 'proj_name',
            },
            {
              name: 'applicant_id',
              type: 'Reference',
              label: 'Applicant',
              reference_target: 'user',
              reference_field_name: 'name',
            },
            { name: 'show_in_suggested_tab', type: 'Boolean' },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            {
              name: 'joblisting_id',
              type: 'Reference',
              label: 'Joblisting',
              reference_target: 'joblisting',
              reference_field_name: 'proj_name',
            },
            {
              name: 'applicant_id',
              type: 'Reference',
              label: 'Applicant',
              reference_target: 'user',
              reference_field_name: 'name',
            },
            { name: 'show_in_suggested_tab', type: 'Boolean' },
          ],
        },
      },
      imported_user: {
        list: { fields: [{ type: '_id' }, { name: 'email', type: 'String' }] },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'email', type: 'String' },
          ],
        },
      },
    },
    association_records: {
      user_has_skill: {
        fields: [
          { name: 'user_id', type: 'Reference', reference_target: 'user' },
          { name: 'skill_id', type: 'Reference', reference_target: 'skill' },
        ],
      },
      user_wants_skill: {
        fields: [
          { name: 'user_id', type: 'Reference', reference_target: 'user' },
          { name: 'skill_id', type: 'Reference', reference_target: 'skill' },
        ],
      },
      user_has_cfunction: {
        fields: [
          { name: 'user_id', type: 'Reference', reference_target: 'user' },
          {
            name: 'cfunction_id',
            type: 'Reference',
            reference_target: 'cfunction',
          },
        ],
      },
      user_wants_cfunction: {
        fields: [
          { name: 'user_id', type: 'Reference', reference_target: 'user' },
          {
            name: 'cfunction_id',
            type: 'Reference',
            reference_target: 'cfunction',
          },
        ],
      },
      joblisting_offers_skill: {
        fields: [
          {
            name: 'joblisting_id',
            type: 'Reference',
            reference_target: 'joblisting',
          },
          { name: 'skill_id', type: 'Reference', reference_target: 'skill' },
        ],
      },
      joblisting_requires_skill: {
        fields: [
          {
            name: 'joblisting_id',
            type: 'Reference',
            reference_target: 'joblisting',
          },
          { name: 'skill_id', type: 'Reference', reference_target: 'skill' },
        ],
      },
      job_application: {
        fields: [
          {
            name: 'joblisting_id',
            type: 'Reference',
            reference_target: 'joblisting',
          },
          { name: 'applicant_id', type: 'Reference', reference_target: 'user' },
        ],
      },
    },
    push_notifications: {
      enabled: true,
      filters: [
        { name: 'name', type: 'String', label: 'Name' },
        {
          name: 'city',
          type: 'Reference',
          reference_target: 'city',
          reference_field_name: 'display_name',
        },
      ],
    },
    user_management: { enabled: true },
  });
});
// tslint:enable:object-literal-sort-keys
