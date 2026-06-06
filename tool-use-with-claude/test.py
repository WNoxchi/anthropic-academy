import math
from main import calculate_pi


def test_pi_5_digits():
    """Test that pi is calculated correctly to 5 decimal places"""
    calculated_pi = calculate_pi(5)
    actual_pi = math.pi
    
    # Round both to 5 decimal places for comparison
    calculated_rounded = round(calculated_pi, 5)
    actual_rounded = round(actual_pi, 5)
    
    print(f"Calculated pi: {calculated_pi}")
    print(f"Actual pi:     {actual_pi}")
    print(f"Calculated (5 digits): {calculated_rounded}")
    print(f"Actual (5 digits):     {actual_rounded}")
    print(f"Difference: {abs(calculated_pi - actual_pi)}")
    
    assert calculated_rounded == actual_rounded, \
        f"Pi calculation incorrect: got {calculated_rounded}, expected {actual_rounded}"
    
    print("✓ Test passed: Pi calculated correctly to 5 decimal places!")


def test_pi_different_precisions():
    """Test pi calculation with different precision levels"""
    actual_pi = math.pi
    
    print("\nTesting different precision levels:")
    for digits in [3, 5, 7, 10]:
        calculated = calculate_pi(digits)
        calculated_rounded = round(calculated, digits)
        actual_rounded = round(actual_pi, digits)
        
        match = calculated_rounded == actual_rounded
        status = "✓" if match else "✗"
        
        print(f"{status} {digits} digits: {calculated_rounded} (expected: {actual_rounded})")
        
        if digits <= 10:  # Should work for up to 10 digits with our implementation
            assert match, f"Failed for {digits} digits"


def test_pi_value_range():
    """Test that calculated pi is in the expected range"""
    calculated_pi = calculate_pi(5)
    
    # Pi should be between 3.14159 and 3.14160
    assert 3.14159 <= calculated_pi <= 3.14160, \
        f"Pi value {calculated_pi} is outside expected range"
    
    print("\n✓ Test passed: Pi is within expected range!")


if __name__ == "__main__":
    print("=" * 60)
    print("Testing Pi Calculation")
    print("=" * 60)
    
    try:
        test_pi_5_digits()
        test_pi_different_precisions()
        test_pi_value_range()
        
        print("\n" + "=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
