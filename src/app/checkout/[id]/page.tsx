import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { courseService } from '@/services/courseService';
import { EnrollmentButton } from '@/components/courses/EnrollmentButton';
import styles from './checkout.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { id } = await params;
  const course = await courseService.getCourseById(id);

  if (!course) return notFound();

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface-container-low)' }}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.main}>
            <h1 className={styles.title}>Secure Checkout</h1>
            <p className={styles.subtitle}>You&apos;re one step away from joining the elite academic cohort.</p>
            
            <Card className={styles.paymentCard}>
              <h3>Payment Method</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                For this demonstration, we are using a simulated payment process.
              </p>
              
              <div className={styles.simulatedCard}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--on-surface-variant)' }}>CARD</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 600 }}>Simulated Payment Card</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>**** **** **** 4242</div>
                </div>
                <div style={{ color: 'var(--secondary)', fontWeight: 700 }}>ACTIVE</div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <EnrollmentButton 
                  courseId={course.id} 
                  isEnrolled={false} 
                  price={0} // Pass 0 here to trigger enrollment in the button since we are "at checkout"
                />
              </div>
            </Card>
          </div>

          <aside className={styles.summary}>
            <Card variant="elevated">
              <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
              <div className={styles.lineItem}>
                <span>{course.title}</span>
                <span>₹{course.price.toLocaleString()}</span>
              </div>
              <div className={styles.lineItem}>
                <span>Platform Fee</span>
                <span>₹0</span>
              </div>
              <div className={styles.total}>
                <span>Total Amount</span>
                <span>₹{course.price.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                By completing this purchase, you agree to the Terms of Service.
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
