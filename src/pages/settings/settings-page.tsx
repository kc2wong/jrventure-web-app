import { makeStyles, tokens } from '@fluentui/react-components';
import { CheckmarkRegular, ChevronLeftRegular } from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import {
  FuiBody1,
  FuiCaption1,
  FuiCard,
  FuiCardHeader,
  FuiSubTitle2,
  FuiSwitch,
  useTheme,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { authActionAtom, authStateAtom } from '../../stores/auth/auth-bloc';

const LANGUAGE_CODES = ['en', 'zh-Hant', 'zh-Hans'] as const;

const useStyles = makeStyles({
  page: {
    minHeight: '100svh',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    background: 'none',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    color: tokens.colorBrandForeground1,
    width: '80px',
  },
  headerTitle: {
    flex: '1',
    textAlign: 'center',
    marginRight: '80px',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  sectionLabel: {
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    paddingLeft: tokens.spacingHorizontalS,
    paddingBottom: tokens.spacingVerticalXS,
  },
  sectionCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '44px',
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    cursor: 'pointer',
    '@media (hover: hover)': {
      ':hover': {
        backgroundColor: tokens.colorNeutralBackground1Hover,
      },
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground1Pressed,
    },
    ':focus': {
      outline: 'none',
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '-2px',
    },
  },
  rowRight: {
    width: '52px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rowDivider: {
    marginLeft: tokens.spacingHorizontalM,
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  checkmark: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
  },
});

export function SettingsPage() {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const { currentTheme, switchTheme } = useTheme();
  const navigate = useNavigate();
  const { selectedStudentId, entitledStudents, user } = useAtomValue(authStateAtom);
  const dispatch = useSetAtom(authActionAtom);
  const { fullNameInPreferredLanguage } = usePreferredLanguage();

  const isDark = currentTheme === 'dark';
  const showStudentSection = user?.role === 'PARENT' && entitledStudents.length > 1;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)} type="button">
          <ChevronLeftRegular fontSize={24} />
          <FuiBody1 text={t('general.text.back')} />
        </button>
        <FuiSubTitle2 className={styles.headerTitle} text={t('setting.title')} />
      </div>

      <div className={styles.body}>
        <div className={styles.section}>
          <FuiCaption1 className={styles.sectionLabel} text={t('setting.appearance')} />
          <FuiCard className={styles.sectionCard}>
            <FuiCardHeader
              action={
                <FuiSwitch
                  checked={isDark}
                  label=""
                  onChange={() => switchTheme(isDark ? 'light' : 'dark')}
                />
              }
              className={styles.row}
              header={<FuiBody1 text={t('setting.darkMode')} />}
            />
          </FuiCard>
        </div>

        {showStudentSection && (
          <div className={styles.section}>
            <FuiCaption1 className={styles.sectionLabel} text={t('setting.student')} />
            <FuiCard className={styles.sectionCard}>
              {entitledStudents.map((s, index) => (
                <div key={s.id}>
                  <div
                    className={styles.row}
                    onClick={() => dispatch({ type: 'SWITCH_STUDENT', payload: { studentId: s.id } })}
                    onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'SWITCH_STUDENT', payload: { studentId: s.id } })}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <FuiBody1
                        text={fullNameInPreferredLanguage(s.firstName, s.lastName)}
                      />
                      <FuiCaption1
                        block
                        style={{ color: tokens.colorNeutralForeground3 }}
                        text={`${s.classId}-${s.studentNumber}`}
                      />
                    </div>
                    <div className={styles.rowRight}>
                      {selectedStudentId === s.id && (
                        <CheckmarkRegular className={styles.checkmark} />
                      )}
                    </div>
                  </div>
                  {index < entitledStudents.length - 1 && (
                    <div className={styles.rowDivider} />
                  )}
                </div>
              ))}
            </FuiCard>
          </div>
        )}

        <div className={styles.section}>
          <FuiCaption1 className={styles.sectionLabel} text={t('setting.language')} />
          <FuiCard className={styles.sectionCard}>
            {LANGUAGE_CODES.map((code, index) => (
              <div key={code}>
                <div
                  className={styles.row}
                  onClick={() => i18n.changeLanguage(code)}
                  onKeyDown={(e) => e.key === 'Enter' && i18n.changeLanguage(code)}
                  role="button"
                  tabIndex={0}
                >
                  <FuiBody1 text={t(`general.language.${code}`)} />
                  <div className={styles.rowRight}>
                    {i18n.language === code && (
                      <CheckmarkRegular className={styles.checkmark} />
                    )}
                  </div>
                </div>
                {index < LANGUAGE_CODES.length - 1 && (
                  <div className={styles.rowDivider} />
                )}
              </div>
            ))}
          </FuiCard>
        </div>
      </div>
    </div>
  );
}
